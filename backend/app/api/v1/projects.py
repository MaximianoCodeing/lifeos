import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
def list_projects(archived: bool = False, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Project).filter(
        and_(Project.user_id == user.id, Project.deleted_at.is_(None), Project.archived == archived)
    ).order_by(Project.created_at.desc()).all()


@router.post("", response_model=ProjectRead, status_code=201)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = Project(**payload.model_dump(), user_id=user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(project_id: uuid.UUID, payload: ProjectUpdate, db: Session = Depends(get_db),
                    user: User = Depends(get_current_user)):
    project = db.query(Project).filter(and_(Project.id == project_id, Project.user_id == user.id)).first()
    if not project:
        raise HTTPException(404, "Projeto não encontrado.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = db.query(Project).filter(and_(Project.id == project_id, Project.user_id == user.id)).first()
    if not project:
        raise HTTPException(404, "Projeto não encontrado.")
    project.deleted_at = datetime.now(timezone.utc)
    db.add(project)
    db.commit()
