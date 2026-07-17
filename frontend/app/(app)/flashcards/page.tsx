"use client";

import { useEffect, useState } from "react";
import { Plus, Star } from "lucide-react";
import { flashcardsApi } from "@/lib/api/client";

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<any[]>([]);
  const [deckName, setDeckName] = useState("");
  const [activeDeck, setActiveDeck] = useState<string | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [due, setDue] = useState<any[]>([]);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);

  function loadDecks() { flashcardsApi.decks().then(setDecks); }
  function loadDue() { flashcardsApi.due().then(setDue); }
  useEffect(() => { loadDecks(); loadDue(); }, []);

  async function createDeck() {
    if (!deckName.trim()) return;
    await flashcardsApi.createDeck({ name: deckName });
    setDeckName("");
    loadDecks();
  }

  async function openDeck(id: string) {
    setActiveDeck(id);
    setCards(await flashcardsApi.cards(id) as any);
  }

  async function addCard() {
    if (!front.trim() || !back.trim() || !activeDeck) return;
    await flashcardsApi.createCard({ deck_id: activeDeck, front, back });
    setFront(""); setBack("");
    openDeck(activeDeck);
  }

  async function toggleFavorite(card: any) {
    await flashcardsApi.updateCard(card.id, { is_favorite: !card.is_favorite });
    if (activeDeck) openDeck(activeDeck);
  }

  async function reviewCard(quality: number) {
    const card = due[reviewIdx];
    await flashcardsApi.review(card.id, quality);
    setShowBack(false);
    if (reviewIdx + 1 < due.length) setReviewIdx((i) => i + 1);
    else { loadDue(); setReviewIdx(0); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Flashcards</h1>

      {due.length > 0 && (
        <div className="rounded-xl border border-signal/40 bg-signal/5 p-5 text-center">
          <p className="text-xs text-muted">Revisão de hoje — {due.length} cartões</p>
          <p className="mt-4 text-lg font-medium">{showBack ? due[reviewIdx].back : due[reviewIdx].front}</p>
          {!showBack ? (
            <button onClick={() => setShowBack(true)} className="mt-4 rounded-lg bg-focus/15 px-4 py-1.5 text-xs text-focus">
              Mostrar resposta
            </button>
          ) : (
            <div className="mt-4 flex justify-center gap-2">
              {[0, 2, 3, 5].map((q) => (
                <button key={q} onClick={() => reviewCard(q)} className="rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-xs">
                  {q === 0 ? "Errei" : q === 2 ? "Difícil" : q === 3 ? "Ok" : "Fácil"}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2">
        <Plus size={15} className="text-muted" />
        <input value={deckName} onChange={(e) => setDeckName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createDeck()}
          placeholder="Novo deck… (Enter para adicionar)" className="flex-1 bg-transparent text-sm outline-none" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {decks.map((d) => (
          <button key={d.id} onClick={() => openDeck(d.id)}
            className={`rounded-lg px-3 py-1.5 text-xs ${activeDeck === d.id ? "bg-focus/15 text-focus" : "border border-[rgb(var(--border))] text-muted"}`}>
            {d.name}
          </button>
        ))}
      </div>

      {activeDeck && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Frente"
              className="flex-1 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2 text-sm outline-none" />
            <input value={back} onChange={(e) => setBack(e.target.value)} placeholder="Verso"
              className="flex-1 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2 text-sm outline-none" />
            <button onClick={addCard} className="rounded-lg bg-focus/15 px-3 text-xs text-focus">Adicionar</button>
          </div>
          <div className="space-y-1.5">
            {cards.map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2 text-sm">
                <span className="flex-1"><span className="font-medium">{c.front}</span> <span className="text-muted">— {c.back}</span></span>
                <button onClick={() => toggleFavorite(c)}>
                  <Star size={13} className={c.is_favorite ? "fill-signal text-signal" : "text-muted"} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
