"""Tool layer for the TutorAgent.

Each module exposes:
- TOOL_SCHEMA: OpenAI function calling JSON schema
- execute(): async callable returning a JSON-serializable dict
"""

from app.tools import code_execution, knowledge_search, problem_search

ALL_TOOL_SCHEMAS = [
    code_execution.TOOL_SCHEMA,
    problem_search.TOOL_SCHEMA,
    knowledge_search.TOOL_SCHEMA,
]

__all__ = [
    "ALL_TOOL_SCHEMAS",
    "code_execution",
    "problem_search",
    "knowledge_search",
]
