from sqlalchemy import JSON, Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedModel


class User(TimestampedModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Preferências do utilizador: tema (dark/light/system), widgets do dashboard,
    # definições do pomodoro, etc. Guardado como JSON flexível para facilitar
    # a evolução do produto sem migrações constantes.
    preferences: Mapped[dict] = mapped_column(
        JSON,
        default=lambda: {
            "theme": "system",
            "dashboard_widgets": [
                "greeting",
                "next_events",
                "next_tasks",
                "habits_today",
                "pomodoros",
                "ai_summary",
            ],
            "pomodoro": {"focus_minutes": 25, "short_break": 5, "long_break": 15},
        },
    )
