"""
Endpoints de agregação transversal: página "Hoje", Favoritos, Arquivados
e badges de contagem para o menu lateral. Reutilizam os modelos já
existentes — não introduzem novas tabelas.
"""
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.task import Task
from app.models.event import Event
from app.models.habit import Habit
from app.models.goal import Goal
from app.models.project import Project
from app.models.note import Note
from app.models.document import Document
from app.models.flashcard import Deck, Flashcard
from app.models.pomodoro import PomodoroSession
from sqlalchemy import or_

router = APIRouter(tags=["overview"])


@router.get("/today")
def today_overview(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    today = date.today()
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start.replace(hour=23, minute=59, second=59)

    tasks_today = db.query(Task).filter(
        Task.user_id == user.id, Task.deleted_at.is_(None), Task.archived.is_(False), Task.due_date == today,
    ).all()
    events_today = db.query(Event).filter(
        Event.user_id == user.id, Event.deleted_at.is_(None),
        Event.start_time >= today_start, Event.start_time <= today_end,
    ).all()
    habits = db.query(Habit).filter(Habit.user_id == user.id, Habit.deleted_at.is_(None)).all()
    habits_pending = [h for h in habits if today.isoformat() not in h.history]

    due_cards = db.query(Flashcard).join(Deck).filter(
        Deck.user_id == user.id, Flashcard.deleted_at.is_(None),
        or_(Flashcard.next_review.is_(None), Flashcard.next_review <= today),
    ).count()

    goals_in_progress = db.query(Goal).filter(
        Goal.user_id == user.id, Goal.deleted_at.is_(None), Goal.progress > 0, Goal.progress < 100,
    ).all()

    focus_minutes_today = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == user.id, PomodoroSession.completed_at.isnot(None),
        PomodoroSession.session_type == "focus", PomodoroSession.started_at >= today_start,
    ).all()
    total_focus_minutes = sum(p.duration_minutes for p in focus_minutes_today)

    next_event = next(iter(sorted(events_today, key=lambda e: e.start_time)), None)

    total_tasks_today = len(tasks_today)
    done_tasks_today = len([t for t in tasks_today if t.status == "concluida"])
    daily_progress = round((done_tasks_today / total_tasks_today) * 100) if total_tasks_today else 0

    return {
        "tasks_today": [{"id": str(t.id), "title": t.title, "status": t.status, "priority": t.priority} for t in tasks_today],
        "events_today": [{"id": str(e.id), "title": e.title, "start_time": e.start_time} for e in events_today],
        "habits_pending": [{"id": str(h.id), "name": h.name} for h in habits_pending],
        "flashcards_due": due_cards,
        "goals_in_progress": [{"id": str(g.id), "title": g.title, "progress": g.progress} for g in goals_in_progress],
        "focus_minutes_today": total_focus_minutes,
        "next_event": {"title": next_event.title, "start_time": next_event.start_time} if next_event else None,
        "daily_progress": daily_progress,
    }


@router.get("/favorites")
def favorites(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.user_id == user.id, Task.is_favorite.is_(True), Task.deleted_at.is_(None)).all()
    projects = db.query(Project).filter(Project.user_id == user.id, Project.is_favorite.is_(True), Project.deleted_at.is_(None)).all()
    notes = db.query(Note).filter(Note.user_id == user.id, Note.is_favorite.is_(True), Note.deleted_at.is_(None)).all()
    documents = db.query(Document).filter(Document.user_id == user.id, Document.is_favorite.is_(True), Document.deleted_at.is_(None)).all()
    cards = db.query(Flashcard).join(Deck).filter(Deck.user_id == user.id, Flashcard.is_favorite.is_(True)).all()

    return (
        [{"type": "tarefa", "id": str(t.id), "title": t.title} for t in tasks]
        + [{"type": "projeto", "id": str(p.id), "title": p.name} for p in projects]
        + [{"type": "nota", "id": str(n.id), "title": n.title} for n in notes]
        + [{"type": "documento", "id": str(d.id), "title": d.filename} for d in documents]
        + [{"type": "flashcard", "id": str(c.id), "title": c.front} for c in cards]
    )


@router.get("/archived")
def archived(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.user_id == user.id, Task.archived.is_(True), Task.deleted_at.is_(None)).all()
    projects = db.query(Project).filter(Project.user_id == user.id, Project.archived.is_(True), Project.deleted_at.is_(None)).all()
    notes = db.query(Note).filter(Note.user_id == user.id, Note.archived.is_(True), Note.deleted_at.is_(None)).all()

    return (
        [{"type": "tarefa", "id": str(t.id), "title": t.title} for t in tasks]
        + [{"type": "projeto", "id": str(p.id), "title": p.name} for p in projects]
        + [{"type": "nota", "id": str(n.id), "title": n.title} for n in notes]
    )


@router.get("/badges")
def badges(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    today = date.today()
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start.replace(hour=23, minute=59, second=59)

    tasks_pending = db.query(Task).filter(
        Task.user_id == user.id, Task.deleted_at.is_(None), Task.archived.is_(False), Task.status != "concluida",
    ).count()
    events_today = db.query(Event).filter(
        Event.user_id == user.id, Event.deleted_at.is_(None),
        Event.start_time >= today_start, Event.start_time <= today_end,
    ).count()
    flashcards_due = db.query(Flashcard).join(Deck).filter(
        Deck.user_id == user.id, Flashcard.deleted_at.is_(None),
        or_(Flashcard.next_review.is_(None), Flashcard.next_review <= today),
    ).count()
    habits = db.query(Habit).filter(Habit.user_id == user.id, Habit.deleted_at.is_(None)).all()
    habits_pending = len([h for h in habits if today.isoformat() not in h.history])

    return {
        "tarefas": tasks_pending,
        "agenda": events_today,
        "flashcards": flashcards_due,
        "habitos": habits_pending,
    }
