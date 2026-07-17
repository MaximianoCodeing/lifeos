import uuid
from pydantic import BaseModel


class NoteBase(BaseModel):
    title: str = "Sem título"
    content: str = ""
    parent_id: uuid.UUID | None = None
    tags: list[str] = []
    icon: str | None = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    parent_id: uuid.UUID | None = None
    tags: list[str] | None = None
    is_favorite: bool | None = None
    archived: bool | None = None
    icon: str | None = None


class NoteRead(NoteBase):
    id: uuid.UUID
    is_favorite: bool
    archived: bool

    class Config:
        from_attributes = True
