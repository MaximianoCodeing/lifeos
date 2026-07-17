"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchApi } from "@/lib/api/client";

interface Command {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  tarefa: "Tarefas", projeto: "Projetos", nota: "Notas", documento: "Documentos",
  habito: "Hábitos", flashcard: "Flashcards",
};
const TYPE_ROUTE: Record<string, string> = {
  tarefa: "/tarefas", projeto: "/projetos", nota: "/notas", documento: "/biblioteca",
  habito: "/habitos", flashcard: "/flashcards",
};

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const commands: Command[] = [
    { id: "dashboard", label: "Ir para Dashboard", run: () => router.push("/dashboard") },
    { id: "hoje", label: "Ir para Hoje", run: () => router.push("/hoje") },
    { id: "agenda", label: "Abrir Calendário", run: () => router.push("/agenda") },
    { id: "tarefas", label: "Abrir Tarefas", run: () => router.push("/tarefas") },
    { id: "pomodoro", label: "Abrir Pomodoro", run: () => router.push("/pomodoro") },
    { id: "notas", label: "Abrir Notas", run: () => router.push("/notas") },
    { id: "favoritos", label: "Abrir Favoritos", run: () => router.push("/favoritos") },
    { id: "arquivados", label: "Abrir Arquivados", run: () => router.push("/arquivados") },
    { id: "lixeira", label: "Abrir Lixeira", run: () => router.push("/lixeira") },
  ];

  const filteredCommands = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (!open) { setQuery(""); setResults([]); }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timeout = setTimeout(() => {
      searchApi.query(query).then(setResults).catch(() => setResults([]));
    }, 250); // pesquisa instantânea com pequeno debounce
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open ? onClose() : window.dispatchEvent(new CustomEvent("lifeos:open-palette"));
      }
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const grouped: Record<string, any[]> = {};
  results.forEach((r) => { (grouped[r.type] ||= []).push(r); });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-32 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[rgb(var(--border))] glass-strong shadow-glass animate-dialog-in"
      >
        <div className="flex items-center gap-2.5 px-4 py-3.5">
          <Search size={15} className="text-muted shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisa em tudo, ou escreve um comando…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <div className="max-h-96 overflow-y-auto border-t border-[rgb(var(--border))] py-1.5">
          {query.length < 2 && filteredCommands.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted">Sem resultados.</p>
          )}

          {query.length < 2 && filteredCommands.map((c) => (
            <button
              key={c.id}
              onClick={() => { c.run(); onClose(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm rounded-lg mx-1.5 w-[calc(100%-12px)] hover:bg-focus/10"
            >
              {c.label}
            </button>
          ))}

          {query.length >= 2 && Object.keys(grouped).length === 0 && (
            <p className="px-4 py-3 text-sm text-muted">Sem resultados para "{query}".</p>
          )}

          {query.length >= 2 && Object.entries(grouped).map(([type, items]) => (
            <div key={type} className="py-1">
              <p className="px-4 py-1 text-[10px] font-medium uppercase tracking-wider text-muted">{TYPE_LABEL[type] || type}</p>
              {items.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => { router.push(TYPE_ROUTE[type] || "/dashboard"); onClose(); }}
                  className="flex w-[calc(100%-12px)] mx-1.5 items-center rounded-lg px-4 py-2 text-left text-sm hover:bg-focus/10"
                >
                  {item.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
