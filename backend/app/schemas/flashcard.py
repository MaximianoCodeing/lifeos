import uuid
from datetime import date
from pydantic import BaseModel


class DeckCreate(BaseModel):
    name: str
    category: str | None = None


class DeckRead(DeckCreate):
    id: uuid.UUID

    class Config:
        from_attributes = True


class FlashcardCreate(BaseModel):
    deck_id: uuid.UUID
    front: str
    back: str
    notes: str | None = None
    tags: list[str] = []
    difficulty: str = "media"
    image_url: str | None = None
    audio_url: str | None = None


class FlashcardReview(BaseModel):
    quality: int  # 0-5, qualidade da resposta (algoritmo SM-2)


class FlashcardRead(BaseModel):
    id: uuid.UUID
    deck_id: uuid.UUID
    front: str
    back: str
    notes: str | None
    tags: list[str]
    difficulty: str
    ease_factor: float
    interval_days: int
    repetitions: int
    next_review: date | None
    times_correct: int
    times_wrong: int
    is_favorite: bool

    class Config:
        from_attributes = True
