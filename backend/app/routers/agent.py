"""Agent router: POST /api/v1/agent/chat

First version returns a plain JSON response. SSE streaming is a TODO.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAIError
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.tutor_agent import TutorAgent
from app.core.database import async_session_maker, get_db
from app.schemas.agent import AgentChatRequest, AgentChatResponse
from app.services.openai_service import get_openai

if TYPE_CHECKING:
    from app.services.rag import RAGService

# TODO(auth): add identity / rate-limit dependency here once auth module lands.
# from app.core.deps import get_current_user  # not yet implemented

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["agent"])


def _get_rag() -> RAGService:
    from app.services.rag import rag_service

    if rag_service is None:  # pragma: no cover - lifespan guarantees it
        raise HTTPException(status_code=503, detail="RAG service not ready")
    return rag_service


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(
    req: AgentChatRequest,
    openai=Depends(get_openai),
    db: AsyncSession = Depends(get_db),
) -> AgentChatResponse:
    # db is injected to keep router contract consistent with the rest of the API,
    # but the agent uses its own session per tool call to avoid long transactions.
    _ = db  # noqa: F841
    rag = _get_rag()
    agent = TutorAgent(openai, async_session_maker, rag)
    try:
        return await agent.run(req)
    except OpenAIError as exc:
        logger.warning("openai error during agent run: %s", type(exc).__name__)
        raise HTTPException(status_code=502, detail=f"LLM 服务不可用: {type(exc).__name__}")
    except Exception:
        logger.exception("agent internal error")
        raise HTTPException(status_code=500, detail="Agent 处理失败")
