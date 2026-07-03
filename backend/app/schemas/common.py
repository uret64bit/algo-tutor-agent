from datetime import datetime
from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel

T = TypeVar("T")


class BaseSchema(BaseModel):
    class Config:
        from_attributes = True


class UUIDSchema(BaseSchema):
    id: UUID


class TimestampSchema(UUIDSchema):
    created_at: datetime
    updated_at: datetime


class PageParams(BaseSchema):
    page: int = 1
    page_size: int = 20


class PageResponse(BaseSchema, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
