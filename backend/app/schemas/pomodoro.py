import uuid
from datetime import datetime
from pydantic import BaseModel


class PomodoroStart(BaseModel):
    session_type: str = "focus"
    duration_minutes: int = 25
    task_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None


class PomodoroRead(BaseModel):
    id: uuid.UUID
    session_type: str
    duration_minutes: int
    started_at: datetime
    completed_at: datetime | None
    task_id: uuid.UUID | None
    project_id: uuid.UUID | None

    class Config:
        from_attributes = True
