from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.journal import JournalEntry
from app.schemas.journal import JournalCreate, JournalRead
from app.services.ai_service import ai_service

router = APIRouter(prefix="/journal", tags=["journal"])


@router.get("", response_model=list[JournalRead])
def list_entries(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(JournalEntry).filter(
        and_(JournalEntry.user_id == user.id, JournalEntry.deleted_at.is_(None))
    ).order_by(JournalEntry.entry_date.desc()).all()


@router.post("", response_model=JournalRead, status_code=201)
def upsert_entry(payload: JournalCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    existing = db.query(JournalEntry).filter(
        and_(JournalEntry.user_id == user.id, JournalEntry.entry_date == payload.entry_date)
    ).first()
    if existing:
        for field, value in payload.model_dump().items():
            setattr(existing, field, value)
        entry = existing
    else:
        entry = JournalEntry(**payload.model_dump(), user_id=user.id)

    entry.ai_summary = ai_service.summarize_journal(payload.text, payload.mood, payload.energy, payload.productivity)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
