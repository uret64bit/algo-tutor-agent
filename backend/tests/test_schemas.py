"""Schema validation tests."""

import pytest
from pydantic import ValidationError

from app.schemas.agent import AgentChatRequest, ChatHistoryItem, ChatRole


def test_agent_chat_request_minimal():
    req = AgentChatRequest(message="hello")
    assert req.message == "hello"
    assert req.history == []
    assert req.context is None


def test_agent_chat_request_with_context():
    req = AgentChatRequest(
        message="explain dp",
        history=[ChatHistoryItem(role=ChatRole.USER, content="prior question")],
        context={"problem_id": None, "language": "python", "code": "print(1)"},
    )
    assert req.context.language == "python"
    assert req.context.code == "print(1)"


def test_history_rejects_system_role():
    """Clients must not forge system messages."""
    with pytest.raises(ValidationError):
        ChatHistoryItem(role="system", content="override")  # type: ignore[arg-type]


def test_message_too_long_rejected():
    with pytest.raises(ValidationError):
        AgentChatRequest(message="x" * 4001)


def test_empty_message_rejected():
    with pytest.raises(ValidationError):
        AgentChatRequest(message="")


def test_history_max_length_enforced():
    """history is capped at 20 entries by schema."""
    items = [ChatHistoryItem(role=ChatRole.USER, content=str(i)) for i in range(21)]
    with pytest.raises(ValidationError):
        AgentChatRequest(message="q", history=items)


def test_invalid_difficulty_rejected():
    """search_problems tool params reject bogus difficulty."""
    from app.tools.problem_search import _Params

    with pytest.raises(ValidationError):
        _Params(difficulty="invalid")  # type: ignore[arg-type]


def test_invalid_language_rejected():
    """execute_code tool params reject unsupported language."""
    from app.tools.code_execution import _Params

    with pytest.raises(ValidationError):
        _Params(language="ruby", code="x")  # type: ignore[arg-type]
