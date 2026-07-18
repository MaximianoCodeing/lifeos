import json
import uuid
from datetime import datetime, date
from fastapi import APIRouter, Depends, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import csv

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.task import Task
from app.services.import_service import read_table, parse_routine, parse_flashcards

router = APIRouter(tags=["import_export"])


@router.post("/import/excel")
async def import_excel(file: UploadFile = File(...), db: Session = Depends(get_db),
                        user: User = Depends(get_current_user)):
    """Importa a rotina do utilizador (Excel/CSV) e cria tarefas automaticamente."""
    content = await file.read()
    df = read_table(file.filename, content)
    items = parse_routine(df)

    created = []
    for item in items:
        due_date = None
        if item["date"]:
            try:
                due_date = date.fromisoformat(item["date"][:10])
            except ValueError:
                due_date = None
        task = Task(user_id=user.id, title=item["title"], due_date=due_date, category="Importado")
        db.add(task)
        created.append(task)
    db.commit()
    return {"created": len(created)}


@router.post("/import/flashcards")
async def import_flashcards_file(
    file: UploadFile = File(...), deck_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db), user: User = Depends(get_current_user),
):
    from app.models.flashcard import Flashcard, Deck
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user.id).first()
    if not deck:
        return {"error": "Deck não encontrado."}

    content = await file.read()
    df = read_table(file.filename, content)
    cards, needs_generation = parse_flashcards(df)

    if needs_generation:
        # O frontend deve perguntar ao utilizador se quer gerar tradução/definição/exemplo
        # via IA antes de confirmar a importação (endpoint /ai/ask pode ser usado para isso).
        return {"needs_generation": True, "preview": cards[:20], "total": len(cards)}

    existing_fronts = {c.front for c in db.query(Flashcard).filter(Flashcard.deck_id == deck_id).all()}
    created = 0
    for c in cards:
        if c["front"] in existing_fronts:
            continue  # elimina duplicados automaticamente
        db.add(Flashcard(deck_id=deck_id, front=c["front"], back=c["back"]))
        created += 1
    db.commit()
    return {"created": created, "skipped_duplicates": len(cards) - created}


@router.get("/export")
def export_data(format: str = "json", db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.user_id == user.id, Task.deleted_at.is_(None)).all()
    rows = [
        {"title": t.title, "status": t.status, "priority": t.priority,
         "due_date": str(t.due_date) if t.due_date else ""}
        for t in tasks
    ]

    if format == "csv":
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=["title", "status", "priority", "due_date"])
        writer.writeheader()
        writer.writerows(rows)
        buf.seek(0)
        return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
                                  headers={"Content-Disposition": "attachment; filename=lifeos_tarefas.csv"})

    if format == "markdown":
        md = "\n".join(f"- [{'x' if r['status'] == 'concluida' else ' '}] {r['title']}" for r in rows)
        return StreamingResponse(iter([md]), media_type="text/markdown",
                                  headers={"Content-Disposition": "attachment; filename=lifeos_tarefas.md"})

    return StreamingResponse(iter([json.dumps(rows, ensure_ascii=False, indent=2)]), media_type="application/json",
                              headers={"Content-Disposition": "attachment; filename=lifeos_tarefas.json"})
