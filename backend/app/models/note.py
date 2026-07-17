import uuid
from sqlalchemy import String, Text, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import TimestampedModel


class Note(TimestampedModel):
    __tablename__ = "notes"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("notes.id"), nullable=True)

    title: Mapped[str] = mapped_column(String(255), default="Sem título")
    content: Mapped[str] = mapped_column(Text, default="")  # Markdown (editor de blocos é evolução futura)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    archived: Mapped[bool] = mapped_column(Boolean, default=False)
    icon: Mapped[str | None] = mapped_column(String(10), nullable=True)  # emoji
