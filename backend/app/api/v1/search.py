from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.search_service import global_search

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
def search(q: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not q or len(q) < 2:
        return []
    return global_search(db, user.id, q)
