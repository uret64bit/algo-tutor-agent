"""Enum value mapping tests.

Ensures all SAEnum columns persist lowercase values matching the DB
migration, not the uppercase Python member names (EASY/MEDIUM/HARD).
Regression guard for the values_callable config.
"""

from app.models.knowledge import (
    KnowledgePoint,
    KnowledgePointDifficulty,
    Lecture,
    LectureLevel,
)
from app.models.problem import Problem, ProblemDifficulty, ProblemStatus, ProblemVariant


def _enum_values(column) -> list[str]:
    """Extract the persisted enum values from a SQLAlchemy column.type."""
    return list(column.type.enums)


def test_problem_difficulty_persists_lowercase():
    assert _enum_values(Problem.difficulty) == ["easy", "medium", "hard"]


def test_problem_status_persists_lowercase():
    assert _enum_values(Problem.status) == ["draft", "published"]


def test_problem_variant_difficulty_persists_lowercase():
    assert _enum_values(ProblemVariant.difficulty) == ["easy", "medium", "hard"]


def test_knowledge_point_difficulty_persists_lowercase():
    assert _enum_values(KnowledgePoint.difficulty) == ["easy", "medium", "hard"]


def test_lecture_level_persists_lowercase():
    assert _enum_values(Lecture.level) == ["card", "standard", "deep"]


def test_enum_member_values_are_lowercase():
    """StrEnum members' .value must equal their lowercase string."""
    for member in ProblemDifficulty:
        assert member.value == member.value.lower()
    for member in ProblemStatus:
        assert member.value == member.value.lower()
    for member in KnowledgePointDifficulty:
        assert member.value == member.value.lower()
    for member in LectureLevel:
        assert member.value == member.value.lower()
