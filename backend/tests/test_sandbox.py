"""Sandbox tests (require Docker + algo-sandbox image).

Marked slow; skipped by default. Run with:
    pytest -m slow
"""

import pytest

from app.tools.code_execution import execute


@pytest.mark.slow
@pytest.mark.asyncio
async def test_execute_python_ok():
    """Test 4: execute_code runs a simple python snippet and reads stdout."""
    result = await execute({"language": "python", "code": "print(1+1)", "timeout_ms": 3000})
    assert result["status"] == "success"
    assert result["stdout"].strip() == "2"
    assert result["exit_code"] == 0


@pytest.mark.slow
@pytest.mark.asyncio
async def test_execute_infinite_loop_timeout():
    """Test 5: an infinite loop is killed by the timeout."""
    result = await execute({"language": "python", "code": "while True:\n    pass", "timeout_ms": 1000})
    assert result["status"] == "timeout"
    assert result["exit_code"] == 124


@pytest.mark.slow
@pytest.mark.asyncio
async def test_execute_cpp_ok():
    """C++ compile + run in the same container produces correct stdout."""
    result = await execute(
        {
            "language": "cpp",
            "code": "#include <iostream>\nint main(){ std::cout << 1+1 << std::endl; return 0; }",
            "timeout_ms": 3000,
        }
    )
    assert result["status"] == "success", f"stderr={result.get('stderr')}"
    assert result["stdout"].strip() == "2"
    assert result["exit_code"] == 0


@pytest.mark.slow
@pytest.mark.asyncio
async def test_execute_java_ok():
    """Java compile + run in the same container produces correct stdout."""
    result = await execute(
        {
            "language": "java",
            "code": "public class Main { public static void main(String[] args){ System.out.println(1+1); } }",
            "timeout_ms": 3000,
        }
    )
    assert result["status"] == "success", f"stderr={result.get('stderr')}"
    assert result["stdout"].strip() == "2"
    assert result["exit_code"] == 0


@pytest.mark.slow
@pytest.mark.asyncio
async def test_execute_runtime_error_python():
    """Runtime error is reported correctly."""
    result = await execute({"language": "python", "code": "print(1/0)", "timeout_ms": 3000})
    assert result["status"] == "runtime_error"
    assert result["exit_code"] != 0
