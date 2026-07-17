import uuid
from datetime import date, timedelta, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.habit import Habit
from app.schemas.habit import HabitCreate, HabitRead

router = APIRouter(prefix="/habits", tags=["habits"])


@router.get("", response_model=list[HabitRead])
def list_habits(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Habit).filter(and_(Habit.user_id == user.id, Habit.deleted_at.is_(None))).all()


@router.post("", response_model=HabitRead, status_code=201)
def create_habit(payload: HabitCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    habit = Habit(**payload.model_dump(), user_id=user.id)
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


@router.post("/{habit_id}/check-in", response_model=HabitRead)
def check_in(habit_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    habit = db.query(Habit).filter(and_(Habit.id == habit_id, Habit.user_id == user.id)).first()
    if not habit:
        raise HTTPException(404, "Hábito não encontrado.")
    today = date.today().isoformat()
    if today not in habit.history:
        habit.history = [*habit.history, today]
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        habit.streak = habit.streak + 1 if yesterday in habit.history[:-1] or habit.streak == 0 else 1
        db.add(habit)
        db.commit()
        db.refresh(habit)
    return habit


@router.delete("/{habit_id}", status_code=204)
def delete_habit(habit_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    habit = db.query(Habit).filter(and_(Habit.id == habit_id, Habit.user_id == user.id)).first()
    if not habit:
        raise HTTPException(404, "Hábito não encontrado.")
    habit.deleted_at = datetime.now(timezone.utc)
    db.add(habit)
    db.commit()
