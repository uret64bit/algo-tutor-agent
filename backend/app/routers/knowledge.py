"""Knowledge router.

Lists knowledge points and their lectures. Read-only.
"""

from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.knowledge import KnowledgePoint, Lecture
from app.schemas.knowledge import KnowledgePointRead, LectureRead

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("/", response_model=list[KnowledgePointRead])
async def list_knowledge_points(
    db: AsyncSession = Depends(get_db),
) -> list[KnowledgePointRead]:
    stmt = select(KnowledgePoint).order_by(KnowledgePoint.order.asc(), KnowledgePoint.name.asc())
    rows = (await db.execute(stmt)).scalars().all()
    return [KnowledgePointRead.model_validate(kp) for kp in rows]


@router.get("/{kp_id}", response_model=KnowledgePointRead)
async def get_knowledge_point(
    kp_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> KnowledgePointRead:
    kp = (await db.execute(select(KnowledgePoint).where(KnowledgePoint.id == kp_id))).scalar_one_or_none()
    if kp is None:
        raise HTTPException(status_code=404, detail="knowledge point not found")
    return KnowledgePointRead.model_validate(kp)


@router.get("/{kp_id}/lectures", response_model=list[LectureRead])
async def get_lectures(
    kp_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> list[LectureRead]:
    stmt = select(Lecture).where(Lecture.knowledge_id == kp_id).order_by(Lecture.level.asc())
    rows = (await db.execute(stmt)).scalars().all()
    return [LectureRead.model_validate(lecture) for lecture in rows]
