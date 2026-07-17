import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.models.note import Note
from app.models.document import Document
from app.models.goal import Goal
from app.models.habit import Habit
from app.models.event import Event

router = APIRouter(prefix="/trash", tags=["trash"])

ENTITY_MAP = {
    "tarefa": Task, "projeto": Project, "nota": Note,
    "documento": Document, "objetivo": Goal, "habito": Habit, "evento": Event,
}


@router.get("")
def list_trash(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = []
    for label, model in ENTITY_MAP.items():
        rows = db.query(model).filter(model.user_id == user.id, model.deleted_at.isnot(None)).all()
        for r in rows:
            name = getattr(r, "title", None) or getattr(r, "name", None) or getattr(r, "filename", "Sem nome")
            items.append({"type": label, "id": str(r.id), "name": name, "deleted_at": r.deleted_at})
    return sorted(items, key=lambda i: i["deleted_at"], reverse=True)


@router.post("/{entity_type}/{entity_id}/restore")
def restore(entity_type: str, entity_id: uuid.UUID, db: Session = Depends(get_db),
            user: User = Depends(get_current_user)):
    model = ENTITY_MAP.get(entity_type)
    if not model:
        raise HTTPException(400, "Tipo de entidade desconhecido.")
    item = db.query(model).filter(model.id == entity_id, model.user_id == user.id).first()
    if not item:
        raise HTTPException(404, "Item não encontrado.")
    item.deleted_at = None
    db.add(item)
    db.commit()
    return {"restored": True}


@router.delete("/{entity_type}/{entity_id}")
def purge(entity_type: str, entity_id: uuid.UUID, db: Session = Depends(get_db),
          user: User = Depends(get_current_user)):
    model = ENTITY_MAP.get(entity_type)
    if not model:
        raise HTTPException(400, "Tipo de entidade desconhecido.")
    item = db.query(model).filter(model.id == entity_id, model.user_id == user.id).first()
    if not item:
        raise HTTPException(404, "Item não encontrado.")
    db.delete(item)
    db.commit()
    return {"purged": True}
