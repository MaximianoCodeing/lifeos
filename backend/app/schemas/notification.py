import uuid
from datetime import datetime
from pydantic import BaseModel


class NotificationRead(BaseModel):
    id: uuid.UUID
    type: str
    content: str
    read: bool
    scheduled_for: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
