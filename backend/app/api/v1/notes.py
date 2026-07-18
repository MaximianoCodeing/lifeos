import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=list[NoteRead])
def list_notes(archived: bool = False, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Note).filter(
        and_(Note.user_id == user.id, Note.deleted_at.is_(None), Note.archived == archived)
    ).order_by(Note.updated_at.desc()).all()


@router.post("", response_model=NoteRead, status_code=201)
def create_note(payload: NoteCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    note = Note(**payload.model_dump(), user_id=user.id)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.patch("/{note_id}", response_model=NoteRead)
def update_note(note_id: uuid.UUID, payload: NoteUpdate, db: Session = Depends(get_db),
                 user: User = Depends(get_current_user)):
    """Usado também para autosave — chamado com debounce pelo frontend."""
    note = db.query(Note).filter(and_(Note.id == note_id, Note.user_id == user.id)).first()
    if not note:
        raise HTTPException(404, "Nota não encontrada.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    note = db.query(Note).filter(and_(Note.id == note_id, Note.user_id == user.id)).first()
    if not note:
        raise HTTPException(404, "Nota não encontrada.")
    note.deleted_at = datetime.now(timezone.utc)
    db.add(note)
    db.commit()
