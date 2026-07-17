import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalRead, GoalUpdate

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=list[GoalRead])
def list_goals(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Goal).filter(and_(Goal.user_id == user.id, Goal.deleted_at.is_(None))).all()


@router.post("", response_model=GoalRead, status_code=201)
def create_goal(payload: GoalCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    goal = Goal(**payload.model_dump(), user_id=user.id)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.patch("/{goal_id}", response_model=GoalRead)
def update_goal(goal_id: uuid.UUID, payload: GoalUpdate, db: Session = Depends(get_db),
                 user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(and_(Goal.id == goal_id, Goal.user_id == user.id)).first()
    if not goal:
        raise HTTPException(404, "Objetivo não encontrado.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(and_(Goal.id == goal_id, Goal.user_id == user.id)).first()
    if not goal:
        raise HTTPException(404, "Objetivo não encontrado.")
    goal.deleted_at = datetime.now(timezone.utc)
    db.add(goal)
    db.commit()
