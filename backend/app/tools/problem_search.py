"""search_problems tool.

Queries the published Problem table. Never returns test_cases or hidden fields.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, field_validator
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.knowledge import KnowledgePoint
from app.models.problem import Problem, ProblemDifficulty, ProblemStatus

TOOL_SCHEMA: dict[str, Any] = {
    "type": "function",
    "function": {
        "name": "search_problems",
        "description": ("搜索算法题库。仅返回已发布 (published) 题目。返回字段不含隐藏测试用例或标准答案。"),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": ["string", "null"],
                    "description": "用于在标题和描述中做关键词检索的文本",
                },
                "difficulty": {
                    "type": ["string", "null"],
                    "enum": ["easy", "medium", "hard"],
                    "description": "按难度过滤",
                },
                "knowledge_slug": {
                    "type": ["string", "null"],
                    "description": "按知识点 slug 过滤",
                },
                "limit": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 10,
                    "default": 5,
                    "description": "返回条目上限，服务端强制 1-10",
                },
            },
            "additionalProperties": False,
        },
    },
}


class _Params(BaseModel):
    query: str | None = None
    difficulty: ProblemDifficulty | None = None
    knowledge_slug: str | None = None
    limit: int = Field(default=5, ge=1, le=10)

    @field_validator("query", mode="before")
    @classmethod
    def _empty_to_none(cls, v: Any) -> Any:
        if v in ("", None):
            return None
        return v


def _serialize(p: Problem) -> dict[str, Any]:
    """Whitelist field set. test_cases and hints intentionally absent.

    hints are withheld from search results to preserve the progressive
    hint flow; they are only available via the dedicated hints endpoint.
    """
    return {
        "id": str(p.id),
        "title": p.title,
        "slug": p.slug,
        "description": p.description[:600],
        "difficulty": p.difficulty.value,
        "time_limit_ms": p.time_limit_ms,
        "memory_limit_kb": p.memory_limit_kb,
        "sample_input": p.sample_input,
        "sample_output": p.sample_output,
    }


async def execute(params: dict[str, Any], db: AsyncSession) -> dict[str, Any]:
    """Run the search. Always returns a JSON-serializable dict."""
    try:
        parsed = _Params.model_validate(params or {})
    except Exception as exc:  # pydantic ValidationError or others
        return {
            "results": [],
            "count": 0,
            "error": f"invalid_params: {exc}",
        }

    stmt = select(Problem).where(Problem.status == ProblemStatus.PUBLISHED)

    if parsed.query:
        like = f"%{parsed.query}%"
        stmt = stmt.where(or_(Problem.title.ilike(like), Problem.description.ilike(like)))

    if parsed.difficulty:
        stmt = stmt.where(Problem.difficulty == parsed.difficulty)

    if parsed.knowledge_slug:
        stmt = stmt.join(Problem.knowledge_points).where(KnowledgePoint.slug == parsed.knowledge_slug)

    stmt = stmt.limit(parsed.limit)

    try:
        result = await db.execute(stmt)
        problems = result.scalars().all()
    except Exception:
        # Let the caller (Agent) decide; never leak DB internals.
        return {
            "results": [],
            "count": 0,
            "error": "database_error",
        }

    if not problems:
        return {
            "results": [],
            "count": 0,
            "message": "未找到匹配题目",
        }

    # Force load knowledge_points to populate references without leaking test_cases.
    # We deliberately do not include test_cases in _serialize.
    return {
        "results": [_serialize(p) for p in problems],
        "count": len(problems),
    }
