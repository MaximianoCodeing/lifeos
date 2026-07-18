import uuid
from pydantic import BaseModel


class ProjectBase(BaseModel):
    name: str
    description: str | None = None
    goal_id: uuid.UUID | None = None
    tags: list[str] = []
    color: str | None = None
    icon: str | None = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    progress: int | None = None
    goal_id: uuid.UUID | None = None
    tags: list[str] | None = None
    is_favorite: bool | None = None
    archived: bool | None = None
    color: str | None = None
    icon: str | None = None


class ProjectRead(ProjectBase):
    id: uuid.UUID
    progress: int
    is_favorite: bool
    archived: bool

    class Config:
        from_attributes = True
