from pydantic import BaseModel
from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


class AskPayload(BaseModel):
    question: str
    context: str = ""


class PlanPayload(BaseModel):
    goal_description: str


class SummarizePayload(BaseModel):
    text: str


@router.post("/ask")
def ask(payload: AskPayload, user: User = Depends(get_current_user)):
    return {"answer": ai_service.answer_question(payload.question, payload.context)}


@router.post("/plan")
def plan(payload: PlanPayload, user: User = Depends(get_current_user)):
    return {"plan": ai_service.generate_plan(payload.goal_description)}


@router.post("/summarize")
def summarize(payload: SummarizePayload, user: User = Depends(get_current_user)):
    return {"summary": ai_service.summarize_document(payload.text)}
