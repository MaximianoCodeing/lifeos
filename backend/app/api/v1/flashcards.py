import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.flashcard import Deck, Flashcard
from app.schemas.flashcard import DeckCreate, DeckRead, FlashcardCreate, FlashcardRead, FlashcardReview
from app.services.spaced_repetition import review_card

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


@router.get("/decks", response_model=list[DeckRead])
def list_decks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Deck).filter(and_(Deck.user_id == user.id, Deck.deleted_at.is_(None))).all()


@router.post("/decks", response_model=DeckRead, status_code=201)
def create_deck(payload: DeckCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    deck = Deck(**payload.model_dump(), user_id=user.id)
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return deck


@router.get("/decks/{deck_id}/cards", response_model=list[FlashcardRead])
def list_cards(deck_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    deck = db.query(Deck).filter(and_(Deck.id == deck_id, Deck.user_id == user.id)).first()
    if not deck:
        raise HTTPException(404, "Deck não encontrado.")
    return db.query(Flashcard).filter(
        and_(Flashcard.deck_id == deck_id, Flashcard.deleted_at.is_(None))
    ).all()


@router.post("/cards", response_model=FlashcardRead, status_code=201)
def create_card(payload: FlashcardCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    deck = db.query(Deck).filter(and_(Deck.id == payload.deck_id, Deck.user_id == user.id)).first()
    if not deck:
        raise HTTPException(404, "Deck não encontrado.")
    card = Flashcard(**payload.model_dump())
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.get("/due", response_model=list[FlashcardRead])
def cards_due_today(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Flashcards para hoje: sem revisão ainda, ou next_review <= hoje."""
    today = date.today()
    return db.query(Flashcard).join(Deck).filter(
        Deck.user_id == user.id,
        Flashcard.deleted_at.is_(None),
        or_(Flashcard.next_review.is_(None), Flashcard.next_review <= today),
    ).all()


@router.post("/cards/{card_id}/review", response_model=FlashcardRead)
def review(card_id: uuid.UUID, payload: FlashcardReview, db: Session = Depends(get_db),
           user: User = Depends(get_current_user)):
    card = db.query(Flashcard).join(Deck).filter(Flashcard.id == card_id, Deck.user_id == user.id).first()
    if not card:
        raise HTTPException(404, "Flashcard não encontrado.")

    ease, interval, reps, next_rev = review_card(card.ease_factor, card.interval_days, card.repetitions, payload.quality)
    card.ease_factor, card.interval_days, card.repetitions, card.next_review = ease, interval, reps, next_rev
    if payload.quality >= 3:
        card.times_correct += 1
    else:
        card.times_wrong += 1

    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.patch("/cards/{card_id}", response_model=FlashcardRead)
def update_card(card_id: uuid.UUID, is_favorite: bool | None = None, front: str | None = None,
                 back: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    card = db.query(Flashcard).join(Deck).filter(Flashcard.id == card_id, Deck.user_id == user.id).first()
    if not card:
        raise HTTPException(404, "Flashcard não encontrado.")
    if is_favorite is not None:
        card.is_favorite = is_favorite
    if front is not None:
        card.front = front
    if back is not None:
        card.back = back
    db.add(card)
    db.commit()
    db.refresh(card)
    return card
