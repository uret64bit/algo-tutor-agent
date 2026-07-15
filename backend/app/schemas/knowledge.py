"""Knowledge 相关 Pydantic Schema (API 契约)。"""

from uuid import UUID

from app.models.knowledge import KnowledgePointDifficulty, LectureLevel
from app.schemas.common import BaseSchema


class KnowledgePointRead(BaseSchema):
    id: UUID
    name: str
    slug: str
    description: str | None
    difficulty: KnowledgePointDifficulty
    parent_id: UUID | None
    order: int


class LectureRead(BaseSchema):
    id: UUID
    knowledge_id: UUID
    level: LectureLevel
    title: str
    content: str


class CodeTemplateRead(BaseSchema):
    id: UUID
    knowledge_id: UUID
    language: str
    template_code: str
    explanation: str | None
