"""
Backup automático/manual. Um job Celery (beat) corre diariamente
app.workers.backup_tasks.run_backup, que exporta os dados de cada
utilizador para JSON (ver app/workers/backup_tasks.py — trocar por
upload a armazenamento externo em produção). Este router expõe o
disparo manual.
"""
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.user import User
from app.workers.backup_tasks import run_backup

router = APIRouter(prefix="/backup", tags=["backup"])


@router.post("/run")
def trigger_backup(user: User = Depends(get_current_user)):
    run_backup.delay(str(user.id))
    return {"status": "agendado", "detail": "O backup foi colocado na fila de processamento."}
