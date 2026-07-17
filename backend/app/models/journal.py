import uuid
from datetime import date
from sqlalchemy import Text, Integer, Date, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import TimestampedModel


class JournalEntry(TimestampedModel):
    __tablename__ = "journal_entries"
    __table_args__ = (UniqueConstraint("user_id", "entry_date", name="uq_journal_user_date"),)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    entry_date: Mapped[date] = mapped_column(Date)
    text: Mapped[str] = mapped_column(Text)
    mood: Mapped[int | None] = mapped_column(Integer, nullable=True)         # 1-5
    energy: Mapped[int | None] = mapped_column(Integer, nullable=True)       # 1-5
    productivity: Mapped[int | None] = mapped_column(Integer, nullable=True) # 1-5
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
