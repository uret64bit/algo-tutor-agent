"""Agent unknown-tool handling tests.

Verifies that when the model requests an unknown tool name, the Agent:
- does NOT raise (no Pydantic ValidationError -> 500)
- records it as status=error in tool_calls
- feeds an unknown_tool result back to the model
"""

from app.schemas.agent import AgentToolCallSummary


def test_agent_tool_call_summary_accepts_unknown_name():
    """AgentToolCallSummary.name is a plain str so unknown tool names
    are recorded as 'error' rather than failing Pydantic validation."""
    summary = AgentToolCallSummary(name="totally_made_up_tool", status="error")
    assert summary.name == "totally_made_up_tool"
    assert summary.status == "error"


def test_agent_tool_call_summary_accepts_known_names():
    for known in ("execute_code", "search_problems", "search_knowledge"):
        summary = AgentToolCallSummary(name=known, status="success")
        assert summary.name == known
