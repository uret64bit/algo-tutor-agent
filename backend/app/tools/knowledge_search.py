"""search_knowledge tool.

Delegates to RAGService for semantic (pgvector) retrieval with an ILIKE
fallback when embeddings are not available. Never fabricates vectors.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from pydantic import BaseModel, Field, field_validator

if TYPE_CHECKING:
    from app.services.rag import RAGService

TOOL_SCHEMA: dict[str, Any] = {
    "type": "function",
    "function": {
        "name": "search_knowledge",
        "description": (
            "检索算法知识库（知识点 / 讲义 / 代码模板）。"
            "优先使用语义检索；若语义检索不可用则降级关键词检索。"
            "返回讲义片段与稳定引用信息。"
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "检索内容关键词或自然语言问题",
                },
                "level": {
                    "type": ["string", "null"],
                    "enum": ["card", "standard", "deep"],
                    "description": "讲义粒度过滤",
                },
                "limit": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 10,
                    "default": 5,
                },
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
}


class _Params(BaseModel):
    query: str = Field(..., min_length=1, max_length=400)
    level: str | None = None
    limit: int = Field(default=5, ge=1, le=10)

    @field_validator("level", mode="before")
    @classmethod
    def _normalize_level(cls, v: Any) -> Any:
        if v in ("", None):
            return None
        if v not in ("card", "standard", "deep"):
            raise ValueError("level must be one of: card, standard, deep")
        return v


async def execute(
    params: dict[str, Any],
    rag: RAGService,
) -> dict[str, Any]:
    """Run the knowledge search. Returns JSON-serializable dict."""
    try:
        parsed = _Params.model_validate(params or {})
    except Exception as exc:
        return {
            "results": [],
            "count": 0,
            "error": f"invalid_params: {exc}",
        }

    try:
        results = await rag.search(
            query=parsed.query,
            level=parsed.level,
            limit=parsed.limit,
        )
    except Exception:
        return {
            "results": [],
            "count": 0,
            "error": "rag_backend_error",
        }

    if not results:
        return {
            "results": [],
            "count": 0,
            "message": "知识库中未检索到直接资料",
        }

    return {
        "results": results,
        "count": len(results),
    }
