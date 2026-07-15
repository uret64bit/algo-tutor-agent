"""pgvector extension + lectures.embedding column

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-15 00:01:00.000000

Adds the vector extension and an embedding column on lectures.
The embedding column is nullable so retrieval degrades to keyword
search when no embeddings have been populated yet.
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    # Use raw SQL so the column type is registered even if pgvector
    # is not yet imported by the SQLAlchemy dialect.
    op.execute("ALTER TABLE lectures ADD COLUMN IF NOT EXISTS embedding vector(1536)")


def downgrade() -> None:
    op.execute("ALTER TABLE lectures DROP COLUMN IF EXISTS embedding")
    # Intentionally not dropping the vector extension; other objects may rely on it.
