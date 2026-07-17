import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _base_query(db: Session, user: User):
    return db.query(Task).filter(and_(Task.user_id == user.id, Task.deleted_at.is_(None)))


@router.get("", response_model=list[TaskRead])
def list_tasks(status: str | None = None, project_id: uuid.UUID | None = None, archived: bool = False,
                db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = _base_query(db, user).filter(Task.archived == archived)
    if status:
        q = q.filter(Task.status == status)
    if project_id:
        q = q.filter(Task.project_id == project_id)
    return q.order_by(Task.due_date.asc().nulls_last(), Task.created_at.desc()).all()


@router.post("", response_model=TaskRead, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    task = Task(**payload.model_dump(), user_id=user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(task_id: uuid.UUID, payload: TaskUpdate, db: Session = Depends(get_db),
                 user: User = Depends(get_current_user)):
    task = _base_query(db, user).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Tarefa não encontrada.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from datetime import datetime, timezone
    task = _base_query(db, user).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Tarefa não encontrada.")
    task.deleted_at = datetime.now(timezone.utc)  # vai para a lixeira
    db.add(task)
    db.commit()
