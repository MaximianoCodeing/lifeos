"""
Backup automático/manual. Exporta todos os dados de cada utilizador para
JSON e guarda em app/../backups/<user_id>/<timestamp>.json.

Em produção, o passo seguinte é enviar este ficheiro para armazenamento
externo (S3-compatible) em vez de disco local — trocar `_write_backup`
por um upload ao serviço de storage escolhido.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

from app.workers.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.models.note import Note
from app.models.habit import Habit
from app.models.goal import Goal
from app.models.journal import JournalEntry
from app.models.flashcard import Deck, Flashcard

BACKUP_DIR = Path(__file__).resolve().parent.parent.parent / "backups"
BACKUP_DIR.mkdir(exist_ok=True)


def _serialize(rows, fields):
    return [{f: getattr(r, f, None) for f in fields} for r in rows]


def _write_backup(user_id, payload: dict):
    user_dir = BACKUP_DIR / str(user_id)
    user_dir.mkdir(exist_ok=True)
    filename = user_dir / f"{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}.json"
    filename.write_text(json.dumps(payload, default=str, ensure_ascii=False, indent=2))
    return str(filename)


@celery_app.task(name="backup.run_backup")
def run_backup(user_id: str | None = None):
    """Se user_id for None, faz backup de todos os utilizadores ativos."""
    db = SessionLocal()
    try:
        users = [db.get(User, user_id)] if user_id else db.query(User).filter(User.is_active.is_(True)).all()
        results = []
        for u in users:
            if not u:
                continue
            payload = {
                "user": {"id": str(u.id), "email": u.email, "name": u.name},
                "tasks": _serialize(db.query(Task).filter(Task.user_id == u.id).all(),
                                     ["id", "title", "status", "priority", "due_date"]),
                "projects": _serialize(db.query(Project).filter(Project.user_id == u.id).all(),
                                        ["id", "name", "progress"]),
                "notes": _serialize(db.query(Note).filter(Note.user_id == u.id).all(),
                                     ["id", "title", "content"]),
                "habits": _serialize(db.query(Habit).filter(Habit.user_id == u.id).all(),
                                      ["id", "name", "streak", "history"]),
                "goals": _serialize(db.query(Goal).filter(Goal.user_id == u.id).all(),
                                     ["id", "title", "progress", "deadline"]),
                "journal": _serialize(db.query(JournalEntry).filter(JournalEntry.user_id == u.id).all(),
                                       ["id", "entry_date", "text", "mood", "energy", "productivity"]),
            }
            path = _write_backup(u.id, payload)
            results.append(path)
        return {"backups_created": results}
    finally:
        db.close()
