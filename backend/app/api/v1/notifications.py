import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationRead

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationRead])
def list_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Notification).filter(Notification.user_id == user.id) \
        .order_by(Notification.created_at.desc()).limit(50).all()


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_read(notification_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    n = db.query(Notification).filter(
        and_(Notification.id == notification_id, Notification.user_id == user.id)
    ).first()
    if not n:
        raise HTTPException(404, "Notificação não encontrada.")
    n.read = True
    db.add(n)
    db.commit()
    db.refresh(n)
    return n
