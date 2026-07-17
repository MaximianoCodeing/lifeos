from datetime import datetime, date, time
from sqlalchemy import String, Text, Integer, Boolean, Date, Time, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from app.db.base import TimestampedModel


class Task(TimestampedModel):
    __tablename__ = "tasks"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    project_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="media")  # baixa, media, alta
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tags: Mapped[list] = mapped_column(JSON, default=list)

    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    due_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    checklist: Mapped[list] = mapped_column(JSON, default=list)   # [{id, text, done}]
    attachments: Mapped[list] = mapped_column(JSON, default=list)  # [{name, url}]
    comments: Mapped[list] = mapped_column(JSON, default=list)     # [{text, created_at}]

    status: Mapped[str] = mapped_column(String(20), default="pendente")  # pendente, em_progresso, concluida
    progress: Mapped[int] = mapped_column(Integer, default=0)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    archived: Mapped[bool] = mapped_column(Boolean, default=False)
