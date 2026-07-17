import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.pomodoro import PomodoroSession
from app.schemas.pomodoro import PomodoroStart, PomodoroRead

router = APIRouter(prefix="/pomodoro", tags=["pomodoro"])


@router.post("/start", response_model=PomodoroRead, status_code=201)
def start_session(payload: PomodoroStart, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    session = PomodoroSession(
        **payload.model_dump(), user_id=user.id, started_at=datetime.now(timezone.utc)
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post("/{session_id}/stop", response_model=PomodoroRead)
def stop_session(session_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    session = db.query(PomodoroSession).filter(
        and_(PomodoroSession.id == session_id, PomodoroSession.user_id == user.id)
    ).first()
    if not session:
        raise HTTPException(404, "Sessão não encontrada.")
    session.completed_at = datetime.now(timezone.utc)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/history", response_model=list[PomodoroRead])
def history(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(PomodoroSession).filter(PomodoroSession.user_id == user.id) \
        .order_by(PomodoroSession.started_at.desc()).limit(100).all()
