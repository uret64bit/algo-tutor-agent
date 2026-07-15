"""Problem 相关 Pydantic Schema (API 契约)。

注意：严禁在公开 Read Schema 中暴露 test_cases 字段。
"""

from uuid import UUID

from pydantic import Field

from app.models.problem import ProblemDifficulty, ProblemStatus
from app.schemas.common import BaseSchema, PageResponse, TimestampSchema


class ProblemBase(BaseSchema):
    title: str = Field(..., max_length=300)
    slug: str = Field(..., max_length=300)
    description: str
    difficulty: ProblemDifficulty
    time_limit_ms: int = 1000
    memory_limit_kb: int = 262144
    sample_input: str | None = None
    sample_output: str | None = None
    hints: list[str] | None = None
    solution_template: dict | None = None
    knowledge_point_ids: list[UUID] = Field(default_factory=list)


class ProblemRead(TimestampSchema, ProblemBase):
    """公开读取 Schema，显式排除 test_cases。"""

    status: ProblemStatus
    submit_count: int
    accepted_count: int


class ProblemListResponse(PageResponse[ProblemRead]):
    pass
