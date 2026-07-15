"""execute_code tool.

Runs user code in an isolated Docker container with:
- network disabled
- non-root user
- CPU / memory / PID / wall-clock limits
- stdout/stderr size caps (via docker log_config + post-truncation)
- server-side fixed command mapping (no shell injection)
- compile + run in the SAME container so artifacts persist
- automatic cleanup of containers

The Agent never receives host paths, image names, or docker config.
"""

from __future__ import annotations

import asyncio
import io
import logging
import tarfile
import time
from typing import Any, Literal

import docker
from docker.errors import APIError, ContainerError, ImageNotFound
from pydantic import BaseModel, Field, field_validator

from app.core.config import settings

logger = logging.getLogger(__name__)

TOOL_SCHEMA: dict[str, Any] = {
    "type": "function",
    "function": {
        "name": "execute_code",
        "description": (
            "在隔离沙箱中执行一段代码以验证行为。"
            "支持 python / cpp / java。"
            "网络被禁用，资源受限，输出会被截断。"
            "调用前应先告知用户将执行代码，不得谎称已执行未实际执行的代码。"
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "language": {
                    "type": "string",
                    "enum": ["python", "cpp", "java"],
                },
                "code": {"type": "string", "description": "待执行源代码"},
                "stdin": {
                    "type": ["string", "null"],
                    "default": "",
                    "description": "提供给程序的标准输入",
                },
                "timeout_ms": {
                    "type": "integer",
                    "minimum": 100,
                    "maximum": 5000,
                    "default": 3000,
                },
                "memory_limit_mb": {
                    "type": "integer",
                    "minimum": 16,
                    "maximum": 512,
                    "default": 256,
                },
            },
            "required": ["language", "code"],
            "additionalProperties": False,
        },
    },
}

# Server-side fixed command mapping. Model/user cannot submit shell.
# Each entry provides the full sequence of commands to run inside ONE container.
# For compiled languages, compile and run happen in the same container so the
# produced artifact (a.out / .class) is available at run time.
_LANGUAGE_CONFIG: dict[str, dict[str, Any]] = {
    "python": {
        "filename": "main.py",
        # No compile step; just run.
        "command": ["python", "/sandbox/main.py"],
    },
    "cpp": {
        "filename": "main.cpp",
        # Compile then run in one shell invocation. The shell exits with the
        # run command's exit code (|| echo ensures compile failures surface).
        "command": [
            "sh",
            "-c",
            "g++ -O2 -std=c++17 -o /sandbox/a.out /sandbox/main.cpp && /sandbox/a.out",
        ],
    },
    "java": {
        "filename": "Main.java",
        "command": [
            "sh",
            "-c",
            "javac /sandbox/Main.java && java -cp /sandbox Main",
        ],
    },
}

ExecutionStatus = Literal["success", "compile_error", "runtime_error", "timeout", "internal_error"]


class _Params(BaseModel):
    language: Literal["python", "cpp", "java"]
    code: str = Field(..., min_length=1, max_length=50000)
    stdin: str | None = Field(default="", max_length=100000)
    timeout_ms: int = Field(default=3000, ge=100, le=5000)
    memory_limit_mb: int = Field(default=256, ge=16, le=512)

    @field_validator("stdin", mode="before")
    @classmethod
    def _normalize_stdin(cls, v: Any) -> Any:
        return "" if v is None else v


def _truncate(data: bytes, limit: int) -> tuple[bytes, bool]:
    if len(data) <= limit:
        return data, False
    return data[:limit], True


def _make_tar(files: dict[str, str]) -> bytes:
    """Create an in-memory tar archive of {filename: content}."""
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w") as tar:
        for name, content in files.items():
            data = content.encode("utf-8")
            info = tarfile.TarInfo(name=name)
            info.size = len(data)
            tar.addfile(info, io.BytesIO(data))
    return buf.getvalue()


def _run_one(
    *,
    image: str,
    command: list[str],
    files: dict[str, str],
    stdin_text: str,
    wall_timeout_s: float,
    mem_limit_mb: int,
    cpu_limit: float,
    pids_limit: int,
    user: str,
    network_disabled: bool,
    max_output_bytes: int,
) -> tuple[str, str, int, bool, ExecutionStatus, int]:
    """Blocking helper run inside asyncio.to_thread.

    Compile + run happen in the SAME container (via shell `&&`), so compiled
    artifacts are available to the run step. Never raises; converts all errors
    into status codes.

    Returns (stdout_text, stderr_text, exit_code, truncated, status, elapsed_ms).
    """
    client = docker.from_env()
    container = None
    start = time.monotonic()
    try:
        # Cap docker-side log size so a malicious infinite-printer cannot
        # blow up the daemon log volume. The container is removed after
        # completion regardless.
        log_config: dict[str, Any] = {
            "type": "json-file",
            "config": {"max-size": "1m", "max-file": "1"},
        }

        run_kwargs: dict[str, Any] = {
            "image": image,
            "command": command,
            "user": user,
            "detach": True,
            "stdin_open": True,
            "tty": False,
            "mem_limit": f"{mem_limit_mb}m",
            "nano_cpus": int(cpu_limit * 1e9),
            "pids_limit": pids_limit,
            "read_only": False,
            "log_config": log_config,
        }
        if network_disabled:
            run_kwargs["network_mode"] = "none"

        container = client.containers.create(**run_kwargs)

        # Inject source files into /sandbox before starting.
        tar_bytes = _make_tar(files)
        try:
            container.put_archive("/sandbox", io.BytesIO(tar_bytes))
        except Exception:
            logger.error("failed to inject source files into sandbox")
            return "", "", -1, False, "internal_error", 0

        container.start()

        # Feed stdin via socket attach (best-effort).
        if stdin_text:
            try:
                socket = container.attach_socket(
                    params={"stdin": True, "stream": True, "stdout": False, "stderr": False}
                )
                socket._sock.sendall(stdin_text.encode("utf-8"))
                socket._sock.close()
            except Exception:
                # Best-effort; ignore stdin failures.
                pass

        try:
            container.wait(timeout=wall_timeout_s)
        except Exception:
            try:
                container.kill()
            except Exception:
                pass
            return "", "", 124, False, "timeout", int((time.monotonic() - start) * 1000)

        exit_code = container.attrs.get("State", {}).get("ExitCode", -1)
        out_bytes = container.logs(stdout=True, stderr=False) or b""
        err_bytes = container.logs(stdout=False, stderr=True) or b""

        if isinstance(out_bytes, str):
            out_bytes = out_bytes.encode("utf-8")
        if isinstance(err_bytes, str):
            err_bytes = err_bytes.encode("utf-8")

        out_bytes, out_trunc = _truncate(out_bytes, max_output_bytes)
        err_bytes, err_trunc = _truncate(err_bytes, max_output_bytes)
        truncated = out_trunc or err_trunc

        if exit_code == 0:
            status: ExecutionStatus = "success"
        else:
            # Distinguish compile_error from runtime_error for compiled langs.
            # The shell `g++ ... && run` exits non-zero on compile failure
            # with g++ output on stderr; a runtime failure has exit code
            # from the program. We use stderr heuristic to classify.
            err_lower = err_bytes.decode("utf-8", errors="replace").lower()
            if "error:" in err_lower and (
                "g++" in err_lower or "javac" in err_lower or ".cpp" in err_lower or ".java" in err_lower
            ):
                status = "compile_error"
            else:
                status = "runtime_error"

        return (
            out_bytes.decode("utf-8", errors="replace"),
            err_bytes.decode("utf-8", errors="replace"),
            exit_code,
            truncated,
            status,
            int((time.monotonic() - start) * 1000),
        )

    except ImageNotFound:
        logger.error("sandbox image not found: image name hidden")
        return "", "", -1, False, "internal_error", 0
    except ContainerError as exc:
        logger.error("sandbox container error: %s", type(exc).__name__)
        return "", "", -1, False, "internal_error", 0
    except APIError as exc:
        logger.error("docker api error: %s", type(exc).__name__)
        return "", "", -1, False, "internal_error", 0
    except Exception:
        logger.exception("sandbox unexpected error")
        return "", "", -1, False, "internal_error", 0
    finally:
        if container is not None:
            try:
                container.remove(force=True)
            except Exception:
                pass


def _build_result(
    stdout: str,
    stderr: str,
    exit_code: int,
    time_used_ms: int,
    truncated: bool,
    status: ExecutionStatus,
) -> dict[str, Any]:
    return {
        "status": status,
        "stdout": stdout,
        "stderr": stderr,
        "exit_code": exit_code,
        "time_used_ms": time_used_ms,
        "truncated": truncated,
    }


async def execute(params: dict[str, Any]) -> dict[str, Any]:
    """Execute code in the sandbox. Returns JSON-serializable dict.

    For compiled languages (cpp/java), compile and run happen in the same
    container via a shell `&&` chain so the compiled artifact persists.
    """
    try:
        parsed = _Params.model_validate(params or {})
    except Exception as exc:
        return _build_result("", f"invalid_params: {exc}", -1, 0, False, "internal_error")

    cfg = _LANGUAGE_CONFIG[parsed.language]
    files = {cfg["filename"]: parsed.code}
    wall_timeout = parsed.timeout_ms / 1000.0 + 2.0

    stdout, stderr, exit_code, truncated, status, elapsed_ms = await asyncio.to_thread(
        _run_one,
        image=settings.SANDBOX_IMAGE,
        command=cfg["command"],
        files=files,
        stdin_text=parsed.stdin or "",
        wall_timeout_s=wall_timeout,
        mem_limit_mb=parsed.memory_limit_mb,
        cpu_limit=settings.SANDBOX_CPU_LIMIT,
        pids_limit=settings.SANDBOX_PIDS_LIMIT,
        user=settings.SANDBOX_USER,
        network_disabled=settings.SANDBOX_NETWORK_DISABLED,
        max_output_bytes=settings.SANDBOX_MAX_OUTPUT_BYTES,
    )

    return _build_result(stdout, stderr, exit_code, elapsed_ms, truncated, status)
