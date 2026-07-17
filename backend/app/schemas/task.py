import uuid
from datetime import date, time
from pydantic import BaseModel


class TaskBase(BaseModel):
    title: str
    description: str | None = None
    priority: str = "media"
    category: str | None = None
    tags: list[str] = []
    project_id: uuid.UUID | None = None
    due_date: date | None = None
    due_time: time | None = None
    duration_minutes: int | None = None
    checklist: list[dict] = []
    status: str = "pendente"
    progress: int = 0


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    project_id: uuid.UUID | None = None
    due_date: date | None = None
    due_time: time | None = None
    duration_minutes: int | None = None
    checklist: list[dict] | None = None
    status: str | None = None
    progress: int | None = None
    is_favorite: bool | None = None
    archived: bool | None = None


class TaskRead(TaskBase):
    id: uuid.UUID
    is_favorite: bool
    archived: bool

    class Config:
        from_attributes = True
