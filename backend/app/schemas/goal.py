import uuid
from datetime import date
from pydantic import BaseModel


class GoalBase(BaseModel):
    title: str
    deadline: date | None = None
    subtasks: list[dict] = []
    color: str | None = None
    icon: str | None = None


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: str | None = None
    deadline: date | None = None
    progress: int | None = None
    subtasks: list[dict] | None = None
    color: str | None = None
    icon: str | None = None


class GoalRead(GoalBase):
    id: uuid.UUID
    progress: int

    class Config:
        from_attributes = True
