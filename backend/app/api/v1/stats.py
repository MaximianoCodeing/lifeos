from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.task import Task
from app.models.pomodoro import PomodoroSession
from app.models.habit import Habit
from app.models.goal import Goal

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/overview")
def overview(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    completed_tasks = db.query(func.count(Task.id)).filter(
        Task.user_id == user.id, Task.status == "concluida"
    ).scalar()
    total_pomodoros = db.query(func.count(PomodoroSession.id)).filter(
        PomodoroSession.user_id == user.id, PomodoroSession.completed_at.isnot(None)
    ).scalar()
    focus_minutes = db.query(func.coalesce(func.sum(PomodoroSession.duration_minutes), 0)).filter(
        PomodoroSession.user_id == user.id, PomodoroSession.session_type == "focus",
        PomodoroSession.completed_at.isnot(None),
    ).scalar()
    active_habits = db.query(func.count(Habit.id)).filter(
        Habit.user_id == user.id, Habit.deleted_at.is_(None)
    ).scalar()
    avg_goal_progress = db.query(func.coalesce(func.avg(Goal.progress), 0)).filter(
        Goal.user_id == user.id, Goal.deleted_at.is_(None)
    ).scalar()

    return {
        "completed_tasks": completed_tasks,
        "total_pomodoros": total_pomodoros,
        "focus_minutes": int(focus_minutes),
        "active_habits": active_habits,
        "avg_goal_progress": round(float(avg_goal_progress), 1),
    }


@router.get("/monthly")
def monthly(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Pomodoros concluídos por dia, últimos 30 dias — para gráficos."""
    since = date.today() - timedelta(days=30)
    rows = db.query(
        func.date(PomodoroSession.started_at).label("day"), func.count(PomodoroSession.id)
    ).filter(
        PomodoroSession.user_id == user.id, PomodoroSession.completed_at.isnot(None),
        PomodoroSession.started_at >= since,
    ).group_by("day").order_by("day").all()
    return [{"date": str(day), "pomodoros": count} for day, count in rows]
