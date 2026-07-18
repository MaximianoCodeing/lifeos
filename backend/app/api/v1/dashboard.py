from datetime import date, datetime, timedelta, timezone
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
from app.models.pomodoro import PomodoroSession

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    today = date.today()

    next_tasks = db.query(Task).filter(
        and_(Task.user_id == user.id, Task.deleted_at.is_(None), Task.status != "concluida")
    ).order_by(Task.due_date.asc().nulls_last()).limit(5).all()

    next_events = db.query(Event).filter(
        and_(Event.user_id == user.id, Event.deleted_at.is_(None), Event.start_time >= now)
    ).order_by(Event.start_time.asc()).limit(5).all()

    habits = db.query(Habit).filter(and_(Habit.user_id == user.id, Habit.deleted_at.is_(None))).all()
    goals = db.query(Goal).filter(and_(Goal.user_id == user.id, Goal.deleted_at.is_(None))).limit(5).all()

    pomodoros_today = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == user.id, PomodoroSession.completed_at.isnot(None),
        PomodoroSession.started_at >= datetime(today.year, today.month, today.day, tzinfo=timezone.utc),
    ).count()

    return {
        "preferences": user.preferences,
        "next_tasks": [{"id": str(t.id), "title": t.title, "due_date": t.due_date} for t in next_tasks],
        "next_events": [{"id": str(e.id), "title": e.title, "start_time": e.start_time} for e in next_events],
        "habits_today": [
            {"id": str(h.id), "name": h.name, "done_today": today.isoformat() in h.history, "streak": h.streak}
            for h in habits
        ],
        "goals": [{"id": str(g.id), "title": g.title, "progress": g.progress} for g in goals],
        "pomodoros_today": pomodoros_today,
    }
