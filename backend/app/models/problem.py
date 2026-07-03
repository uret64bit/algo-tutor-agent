from enum import Enum as PyEnum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.knowledge import KnowledgePoint


class ProblemDifficulty(str, PyEnum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ProblemStatus(str, PyEnum):
    DRAFT = "draft"
    PUBLISHED = "published"


class Problem(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "problems"

    title: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(300), nullable=False, unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[ProblemDifficulty] = mapped_column(
        SAEnum(ProblemDifficulty, name="problem_difficulty"),
        nullable=False,
        default=ProblemDifficulty.EASY,
    )
    status: Mapped[ProblemStatus] = mapped_column(
        SAEnum(ProblemStatus, name="problem_status"),
        nullable=False,
        default=ProblemStatus.DRAFT,
    )
    time_limit_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=1000)
    memory_limit_kb: Mapped[int] = mapped_column(Integer, nullable=False, default=262144)
    sample_input: Mapped[str | None] = mapped_column(Text, nullable=True)
    sample_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    hints: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    solution_template: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    test_cases: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list)
    submit_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    accepted_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    knowledge_points: Mapped[list["KnowledgePoint"]] = relationship(
        "KnowledgePoint",
        secondary="problem_knowledge_points",
        back_populates="problems",
    )


class ProblemKnowledgePoint(Base):
    __tablename__ = "problem_knowledge_points"

    problem_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("problems.id", ondelete="CASCADE"),
        primary_key=True,
    )
    knowledge_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("knowledge_points.id", ondelete="CASCADE"),
        primary_key=True,
    )


class ProblemVariant(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "problem_variants"

    original_problem_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("problems.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[ProblemDifficulty] = mapped_column(
        SAEnum(ProblemDifficulty, name="problem_difficulty"), nullable=False
    )
    test_cases: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list)
    time_limit_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=1000)
    memory_limit_kb: Mapped[int] = mapped_column(Integer, nullable=False, default=262144)
    created_by: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    is_preset: Mapped[bool] = mapped_column(default=False, nullable=False)

    original_problem: Mapped[Problem] = relationship(Problem, backref="variants")


class Solution(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "solutions"

    problem_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("problems.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(50), nullable=True)
    code: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_featured: Mapped[bool] = mapped_column(default=False, nullable=False)
    like_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    problem: Mapped[Problem] = relationship(Problem, backref="solutions")


class SolutionComment(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "solution_comments"

    solution_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("solutions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    parent_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("solution_comments.id", ondelete="CASCADE"),
        nullable=True,
    )

    solution: Mapped[Solution] = relationship(Solution, backref="comments")
    parent: Mapped["SolutionComment | None"] = relationship(
        "SolutionComment", remote_side="SolutionComment.id"
    )
