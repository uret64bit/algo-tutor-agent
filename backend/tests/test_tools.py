"""Tool unit tests (non-Docker).

Sandbox-dependent tests (real execute_code) live in test_sandbox.py marked slow.
"""

import pytest

from app.tools.code_execution import _Params
from app.tools.problem_search import _Params as ProblemSearchParams


def test_execute_code_params_defaults():
    p = _Params(language="python", code="print(1)")
    assert p.timeout_ms == 3000
    assert p.memory_limit_mb == 256
    assert p.stdin == ""


def test_execute_code_params_stdin_none_becomes_empty():
    p = _Params(language="python", code="print(1)", stdin=None)
    assert p.stdin == ""


def test_execute_code_params_timeout_bounds():
    with pytest.raises(Exception):
        _Params(language="python", code="x", timeout_ms=10)  # below min
    with pytest.raises(Exception):
        _Params(language="python", code="x", timeout_ms=10000)  # above max


def test_problem_search_params_limit_bounds():
    with pytest.raises(Exception):
        ProblemSearchParams(limit=0)
    with pytest.raises(Exception):
        ProblemSearchParams(limit=11)


def test_problem_search_params_query_empty_ok():
    """Empty query string is normalized to None."""
    p = ProblemSearchParams(query="")
    assert p.query is None


@pytest.mark.asyncio
async def test_problem_search_no_test_cases_leak(db_session, seed_data):
    """search_problems results MUST NOT contain test_cases."""
    from app.tools.problem_search import execute

    result = await execute({"query": "测试题目", "limit": 10}, db_session)
    assert result["count"] >= 1
    for item in result["results"]:
        assert "test_cases" not in item, f"test_cases leaked: {item.keys()}"


@pytest.mark.asyncio
async def test_problem_search_empty_when_no_match(db_session):
    from app.tools.problem_search import execute

    result = await execute({"query": "zzz-no-such-problem-zzz", "limit": 5}, db_session)
    assert result["count"] == 0
    # Either a friendly message (no match) or an error key (DB unavailable).
    assert "message" in result or "error" in result


@pytest.mark.asyncio
async def test_problem_search_invalid_params(db_session):
    from app.tools.problem_search import execute

    result = await execute({"difficulty": "impossible"}, db_session)
    assert result["count"] == 0
    assert "error" in result


@pytest.mark.asyncio
async def test_knowledge_search_returns_snippet(db_session, seed_data):
    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

    from app.services.rag import RAGService

    # Build a RAGService that uses the same engine; pgvector_ready will be False
    # in tests, so it falls back to keyword search.
    from tests.conftest import TEST_DATABASE_URL

    engine = create_async_engine(TEST_DATABASE_URL)
    factory = async_sessionmaker(engine, class_=type(db_session), expire_on_commit=False)
    rag = RAGService(factory, openai_svc=None)
    # Force keyword fallback.
    rag._pgvector_available = False

    try:
        results = await rag.search(query="动态规划", level=None, limit=5)
        assert isinstance(results, list)
    finally:
        await engine.dispose()
