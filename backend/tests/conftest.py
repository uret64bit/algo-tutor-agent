"""Pytest configuration and fixtures.

Uses a real PostgreSQL database (pgvector requires PG). The test DB is
expected to exist; CI / local dev must provision it. Set
TEST_DATABASE_URL to point to a scratch DB; otherwise we reuse the
default DATABASE_URL.
"""

from __future__ import annotations

import asyncio
import os
from collections.abc import AsyncGenerator
from typing import Any
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# We must import app modules *after* configuring env, but pydantic-settings
# reads env at import time. Tests run with the existing settings; if a
# TEST_DATABASE_URL is set we override the engine used by get_db via
# dependency_overrides.

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    os.environ.get(
        "DATABASE_URL",
        "postgresql+asyncpg://algo_tutor:algo_tutor_secret@localhost:5432/algo_tutor",
    ),
)


@pytest.fixture(scope="session")
def event_loop():
    """Single event loop for the whole session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    # Ensure schema exists (assumes migrations applied out-of-band).
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Per-test session inside a transaction that is rolled back."""
    factory = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)
    async with factory() as session:
        # Use a nested transaction so tests can commit and we still roll back.
        async with session.begin():
            yield session
            # rollback on exit
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """HTTP client with get_db overridden to the test session."""
    from app.core.database import get_db
    from app.main import app

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    # Also override openai_service + rag_service so we don't need a live key.
    import app.services.openai_service as openai_module
    import app.services.rag as rag_module
    from app.services.openai_service import OpenAIService

    # Save originals to restore later.
    orig_openai = openai_module.openai_service
    orig_rag = rag_module.rag_service

    openai_module.openai_service = OpenAIService.__new__(OpenAIService)
    openai_module.openai_service.client = None  # tests inject mocks
    rag_module.rag_service = rag_module.RAGService.__new__(rag_module.RAGService)
    rag_module.rag_service._session_factory = None  # type: ignore[attr-defined]
    rag_module.rag_service._openai = None
    rag_module.rag_service._pgvector_available = False

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    openai_module.openai_service = orig_openai
    rag_module.rag_service = orig_rag


@pytest_asyncio.fixture
async def seed_data(db_session: AsyncSession) -> dict[str, Any]:
    """Insert a published problem + knowledge point + lecture.

    Returns dict with ids. The whole transaction is rolled back at test end.
    """
    from app.models.knowledge import KnowledgePoint, Lecture, LectureLevel
    from app.models.problem import Problem, ProblemDifficulty, ProblemStatus

    kp_id = uuid4()
    lecture_id = uuid4()
    problem_id = uuid4()

    kp = KnowledgePoint(
        id=kp_id,
        name=f"测试知识点 {kp_id}",
        slug=f"test-kp-{kp_id}",
        description="用于测试的知识点",
    )
    db_session.add(kp)
    await db_session.flush()

    lecture = Lecture(
        id=lecture_id,
        knowledge_id=kp_id,
        level=LectureLevel.STANDARD,
        title="测试讲义",
        content="动态规划的核心是状态与状态转移方程。",
    )
    db_session.add(lecture)

    problem = Problem(
        id=problem_id,
        title=f"测试题目 {problem_id}",
        slug=f"test-problem-{problem_id}",
        description="一道用于测试的题目：求两数之和。",
        difficulty=ProblemDifficulty.EASY,
        status=ProblemStatus.PUBLISHED,
        time_limit_ms=1000,
        memory_limit_kb=262144,
        sample_input="1 2",
        sample_output="3",
        hints=["使用加法"],
        solution_template=None,
        # Hidden test cases — must NEVER appear in API output.
        test_cases=[{"input": "1 2", "output": "3", "hidden": True}],
        submit_count=10,
        accepted_count=8,
    )
    problem.knowledge_points.append(kp)
    db_session.add(problem)
    await db_session.flush()

    return {
        "knowledge_point_id": kp_id,
        "lecture_id": lecture_id,
        "problem_id": problem_id,
    }
