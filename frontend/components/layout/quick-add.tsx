"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, X, CheckSquare, FolderKanban, FileText, Layers, Target, Repeat, Calendar,
} from "lucide-react";
import { tasksApi, projectsApi, notesApi, flashcardsApi, goalsApi, habitsApi, calendarApi } from "@/lib/api/client";
import { useToast } from "./toast-provider";

const ITEMS = [
  { id: "tarefa", label: "Nova tarefa", icon: CheckSquare },
  { id: "projeto", label: "Novo projeto", icon: FolderKanban },
  { id: "nota", label: "Nova nota", icon: FileText },
  { id: "flashcard", label: "Novo flashcard", icon: Layers },
  { id: "objetivo", label: "Novo objetivo", icon: Target },
  { id: "habito", label: "Novo hábito", icon: Repeat },
  { id: "evento", label: "Novo evento", icon: Calendar },
];

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setMode("tarefa"); setOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setMode("nota"); setOpen(true);
      }
      if (e.key === "Escape") { setOpen(false); setMode(null); }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function close() {
    setOpen(false); setMode(null); setValue("");
  }

  async function submit() {
    if (!value.trim() || !mode) return;
    setSaving(true);
    try {
      switch (mode) {
        case "tarefa": await tasksApi.create({ title: value }); router.push("/tarefas"); break;
        case "projeto": await projectsApi.create({ name: value }); router.push("/projetos"); break;
        case "nota": { const n: any = await notesApi.create({ title: value, content: "" }); router.push("/notas"); break; }
        case "objetivo": await goalsApi.create({ title: value }); router.push("/objetivos"); break;
        case "habito": await habitsApi.create({ name: value }); router.push("/habitos"); break;
        case "evento": await calendarApi.create({ title: value, start_time: new Date().toISOString() }); router.push("/agenda"); break;
        case "flashcard": {
          const decks: any = await flashcardsApi.decks();
          let deckId = decks[0]?.id;
          if (!deckId) { const d: any = await flashcardsApi.createDeck({ name: "Geral" }); deckId = d.id; }
          await flashcardsApi.createCard({ deck_id: deckId, front: value, back: "" });
          router.push("/flashcards");
          break;
        }
      }
    } catch {
      // segue mesmo sem backend disponível, apenas navega
    } finally {
      setSaving(false);
      close();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Criar novo"
        className="fixed bottom-6 right-6 z-30 flex items-center justify-center rounded-full bg-focus text-white shadow-soft-lg transition-all duration-200 ease-smooth hover:scale-105 hover:shadow-glass active:scale-95 md:bottom-8 md:right-8"
        style={{ width: 52, height: 52 }}
      >
        <Plus size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-end bg-black/30 backdrop-blur-[2px] p-4 md:items-end md:p-8 animate-fade-in" onClick={close}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs overflow-hidden rounded-2xl border border-[rgb(var(--border))] glass-strong shadow-glass mb-16 md:mb-14 animate-dialog-in"
          >
            {!mode ? (
              <div className="py-1">
                {ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setMode(id)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-focus/10"
                  >
                    <Icon size={15} className="text-muted" /> {label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-muted">{ITEMS.find((i) => i.id === mode)?.label}</span>
                  <button onClick={close}><X size={14} className="text-muted" /></button>
                </div>
                <input
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Escreve o título e prime Enter…"
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm outline-none focus:border-focus"
                />
                <button
                  onClick={submit}
                  disabled={saving}
                  className="mt-2 w-full rounded-lg bg-focus py-2 text-sm text-white disabled:opacity-50"
                >
                  {saving ? "A criar…" : "Criar"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
