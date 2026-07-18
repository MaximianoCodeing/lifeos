"""Pesquisa global simples (ILIKE) através de todas as entidades do utilizador."""
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.task import Task
from app.models.project import Project
from app.models.note import Note
from app.models.document import Document
from app.models.flashcard import Flashcard, Deck
from app.models.habit import Habit
from app.models.journal import JournalEntry


def global_search(db: Session, user_id, query: str) -> list[dict]:
    like = f"%{query}%"
    results = []

    for t in db.query(Task).filter(Task.user_id == user_id, Task.title.ilike(like)).limit(10):
        results.append({"type": "tarefa", "id": str(t.id), "title": t.title})
    for p in db.query(Project).filter(Project.user_id == user_id, Project.name.ilike(like)).limit(10):
        results.append({"type": "projeto", "id": str(p.id), "title": p.name})
    for n in db.query(Note).filter(Note.user_id == user_id, or_(Note.title.ilike(like), Note.content.ilike(like))).limit(10):
        results.append({"type": "nota", "id": str(n.id), "title": n.title})
    for d in db.query(Document).filter(Document.user_id == user_id, Document.filename.ilike(like)).limit(10):
        results.append({"type": "documento", "id": str(d.id), "title": d.filename})
    for h in db.query(Habit).filter(Habit.user_id == user_id, Habit.name.ilike(like)).limit(10):
        results.append({"type": "habito", "id": str(h.id), "title": h.name})
    for f in db.query(Flashcard).join(Deck).filter(Deck.user_id == user_id, Flashcard.front.ilike(like)).limit(10):
        results.append({"type": "flashcard", "id": str(f.id), "title": f.front})

    return results
