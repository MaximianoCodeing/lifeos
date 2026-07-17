import uuid
from datetime import datetime
from pydantic import BaseModel


class EventBase(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime | None = None
    color: str = "focus"
    category: str | None = None
    tags: list[str] = []
    recurrence: dict | None = None
    task_id: uuid.UUID | None = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    color: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    recurrence: dict | None = None


class EventRead(EventBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
