"""
Tarefas periódicas (Celery beat) que geram notificações automáticas:
- Flashcards para rever hoje
- Hábitos ainda não marcados hoje
- Objetivos com prazo ultrapassado
- Lembrete de pomodoro se não houve nenhum concluído até ao fim do dia

Corre uma vez por utilizador ativo. Agendamento definido em celery_app.py.
"""
from datetime import date, datetime, timezone

from app.workers.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.habit import Habit
from app.models.goal import Goal
from app.models.flashcard import Flashcard, Deck
from app.models.pomodoro import PomodoroSession
from app.models.notification import Notification
from sqlalchemy import or_


def _create_notification(db, user_id, ntype: str, content: str):
    """Evita duplicar a mesma notificação no mesmo dia."""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    existing = db.query(Notification).filter(
        Notification.user_id == user_id, Notification.type == ntype,
        Notification.created_at >= today_start,
    ).first()
    if existing:
        return
    db.add(Notification(user_id=user_id, type=ntype, content=content))


@celery_app.task(name="notifications.check_habits_pending")
def check_habits_pending():
    db = SessionLocal()
    try:
        today = date.today().isoformat()
        habits = db.query(Habit).filter(Habit.deleted_at.is_(None)).all()
        for h in habits:
            if today not in h.history:
                _create_notification(db, h.user_id, "habito", f"Ainda não marcaste o hábito '{h.name}' hoje.")
        db.commit()
    finally:
        db.close()


@celery_app.task(name="notifications.check_goals_overdue")
def check_goals_overdue():
    db = SessionLocal()
    try:
        today = date.today()
        goals = db.query(Goal).filter(
            Goal.deleted_at.is_(None), Goal.deadline.isnot(None), Goal.deadline < today, Goal.progress < 100,
        ).all()
        for g in goals:
            _create_notification(db, g.user_id, "objetivo", f"O objetivo '{g.title}' passou do prazo.")
        db.commit()
    finally:
        db.close()


@celery_app.task(name="notifications.check_flashcards_due")
def check_flashcards_due():
    db = SessionLocal()
    try:
        today = date.today()
        due = db.query(Flashcard).join(Deck).filter(
            Flashcard.deleted_at.is_(None),
            or_(Flashcard.next_review.is_(None), Flashcard.next_review <= today),
        ).all()
        counts: dict = {}
        deck_owner = {}
        for f in due:
            deck = db.query(Deck).filter(Deck.id == f.deck_id).first()
            counts[deck.user_id] = counts.get(deck.user_id, 0) + 1
            deck_owner[deck.user_id] = True
        for user_id, count in counts.items():
            _create_notification(db, user_id, "flashcard", f"Tens {count} flashcards para rever hoje.")
        db.commit()
    finally:
        db.close()


@celery_app.task(name="notifications.check_pomodoro_reminder")
def check_pomodoro_reminder():
    """Corre ao fim da tarde: lembra quem ainda não fez nenhum pomodoro hoje."""
    db = SessionLocal()
    try:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        users = db.query(User).filter(User.is_active.is_(True)).all()
        for u in users:
            done_today = db.query(PomodoroSession).filter(
                PomodoroSession.user_id == u.id, PomodoroSession.completed_at.isnot(None),
                PomodoroSession.started_at >= today_start,
            ).count()
            if done_today == 0:
                _create_notification(db, u.id, "pomodoro", "Ainda não fizeste nenhum Pomodoro hoje.")
        db.commit()
    finally:
        db.close()
