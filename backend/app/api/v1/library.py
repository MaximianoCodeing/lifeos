import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.document import Document
from app.services.file_service import detect_type, save_upload, extract_text
from app.services.ai_service import ai_service

router = APIRouter(prefix="/library", tags=["library"])


@router.get("")
def list_documents(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    docs = db.query(Document).filter(and_(Document.user_id == user.id, Document.deleted_at.is_(None))) \
        .order_by(Document.created_at.desc()).all()
    return [
        {"id": str(d.id), "filename": d.filename, "file_type": d.file_type,
         "size_bytes": d.size_bytes, "tags": d.tags, "is_favorite": d.is_favorite,
         "created_at": d.created_at}
        for d in docs
    ]


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    action: str = "guardar",  # guardar | resumir | flashcards | tarefas | checklist
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Upload inteligente: o frontend pergunta ao utilizador 'o que pretende fazer?'
    e envia a ação escolhida (guardar / resumir / criar flashcards / criar tarefas / checklist).
    """
    content = await file.read()
    file_type = detect_type(file.filename)
    path, size = save_upload(file.filename, content)
    text = extract_text(path, file_type)

    doc = Document(
        user_id=user.id, filename=file.filename, file_type=file_type,
        storage_path=path, size_bytes=size, extracted_text=text,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    result = {"document_id": str(doc.id), "action": action}

    if action == "resumir" and text:
        result["summary"] = ai_service.summarize_document(text)
    elif action == "flashcards" and text:
        result["flashcards_raw"] = ai_service.generate_flashcards(text)
    elif action == "checklist" and text:
        result["checklist_raw"] = ai_service.generate_checklist(text)

    return result


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(and_(Document.id == document_id, Document.user_id == user.id)).first()
    if not doc:
        raise HTTPException(404, "Documento não encontrado.")
    doc.deleted_at = datetime.now(timezone.utc)
    db.add(doc)
    db.commit()
