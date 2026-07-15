"""Problems router.

Returns published problems. Never exposes test_cases in any response.
"""

from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.knowledge import KnowledgePoint
from app.models.problem import Problem, ProblemDifficulty, ProblemStatus
from app.schemas.problem import ProblemListResponse, ProblemRead

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/problems", tags=["problems"])


def _to_read(p: Problem) -> ProblemRead:
    return ProblemRead.model_validate(
        {
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "description": p.description,
            "difficulty": p.difficulty,
            "status": p.status,
            "time_limit_ms": p.time_limit_ms,
            "memory_limit_kb": p.memory_limit_kb,
            "sample_input": p.sample_input,
            "sample_output": p.sample_output,
            "hints": p.hints,
            "solution_template": p.solution_template,
            "knowledge_point_ids": [kp.id for kp in (p.knowledge_points or [])],
            "submit_count": p.submit_count,
            "accepted_count": p.accepted_count,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
        }
    )


@router.get("/", response_model=ProblemListResponse)
async def list_problems(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    difficulty: ProblemDifficulty | None = None,
    search: str | None = Query(None, max_length=200),
    db: AsyncSession = Depends(get_db),
) -> ProblemListResponse:
    stmt = (
        select(Problem).where(Problem.status == ProblemStatus.PUBLISHED).options(selectinload(Problem.knowledge_points))
    )

    if difficulty:
        stmt = stmt.where(Problem.difficulty == difficulty)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(or_(Problem.title.ilike(like), Problem.description.ilike(like)))

    # Total count for pagination.
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    offset = (page - 1) * page_size
    stmt = stmt.order_by(Problem.created_at.desc()).offset(offset).limit(page_size)
    problems = (await db.execute(stmt)).scalars().all()

    total_pages = (total + page_size - 1) // page_size if total else 0
    return ProblemListResponse(
        items=[_to_read(p) for p in problems],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# Static route declared BEFORE the dynamic /{problem_id} route so that
# /by-knowledge/{slug} is not swallowed by UUID parsing.
@router.get("/by-knowledge/{slug}", response_model=ProblemListResponse)
async def list_problems_by_knowledge(
    slug: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> ProblemListResponse:
    stmt = (
        select(Problem)
        .where(Problem.status == ProblemStatus.PUBLISHED)
        .join(Problem.knowledge_points)
        .where(KnowledgePoint.slug == slug)
        .options(selectinload(Problem.knowledge_points))
    )
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    offset = (page - 1) * page_size
    stmt = stmt.order_by(Problem.created_at.desc()).offset(offset).limit(page_size)
    problems = (await db.execute(stmt)).scalars().all()

    total_pages = (total + page_size - 1) // page_size if total else 0
    return ProblemListResponse(
        items=[_to_read(p) for p in problems],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{problem_id}", response_model=ProblemRead)
async def get_problem(
    problem_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> ProblemRead:
    stmt = (
        select(Problem)
        .where(
            Problem.id == problem_id,
            Problem.status == ProblemStatus.PUBLISHED,
        )
        .options(selectinload(Problem.knowledge_points))
    )
    p = (await db.execute(stmt)).scalar_one_or_none()
    if p is None:
        raise HTTPException(status_code=404, detail="problem not found or not published")
    return _to_read(p)
