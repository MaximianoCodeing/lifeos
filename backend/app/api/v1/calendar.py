import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.event import Event
from app.models.task import Task
from app.schemas.event import EventCreate, EventRead, EventUpdate

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/events", response_model=list[EventRead])
def list_events(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Event).filter(and_(Event.user_id == user.id, Event.deleted_at.is_(None))).all()


@router.post("/events", response_model=EventRead, status_code=201)
def create_event(payload: EventCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    event = Event(**payload.model_dump(), user_id=user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/events/{event_id}", response_model=EventRead)
def update_event(event_id: uuid.UUID, payload: EventUpdate, db: Session = Depends(get_db),
                  user: User = Depends(get_current_user)):
    event = db.query(Event).filter(and_(Event.id == event_id, Event.user_id == user.id)).first()
    if not event:
        raise HTTPException(404, "Evento não encontrado.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/events/{event_id}", status_code=204)
def delete_event(event_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    event = db.query(Event).filter(and_(Event.id == event_id, Event.user_id == user.id)).first()
    if not event:
        raise HTTPException(404, "Evento não encontrado.")
    event.deleted_at = datetime.now(timezone.utc)
    db.add(event)
    db.commit()


@router.get("/merged")
def merged_calendar(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Devolve eventos + tarefas com data, prontos para o calendário."""
    events = db.query(Event).filter(and_(Event.user_id == user.id, Event.deleted_at.is_(None))).all()
    tasks = db.query(Task).filter(
        and_(Task.user_id == user.id, Task.deleted_at.is_(None), Task.due_date.isnot(None))
    ).all()

    items = [
        {"id": str(e.id), "title": e.title, "start": e.start_time.isoformat(),
         "end": e.end_time.isoformat() if e.end_time else None, "color": e.color, "source": "event"}
        for e in events
    ]
    items += [
        {"id": str(t.id), "title": t.title, "start": t.due_date.isoformat(),
         "end": None, "color": "signal", "source": "task", "priority": t.priority}
        for t in tasks
    ]
    return items
