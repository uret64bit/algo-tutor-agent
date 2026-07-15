from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


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


class PageResponse[T](BaseSchema):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
