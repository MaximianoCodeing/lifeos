import uuid
from datetime import date
from pydantic import BaseModel


class JournalBase(BaseModel):
    entry_date: date
    text: str
    mood: int | None = None
    energy: int | None = None
    productivity: int | None = None


class JournalCreate(JournalBase):
    pass


class JournalRead(JournalBase):
    id: uuid.UUID
    ai_summary: str | None = None

    class Config:
        from_attributes = True
