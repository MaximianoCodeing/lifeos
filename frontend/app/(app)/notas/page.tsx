"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, FileText, Eye, Pencil, Columns2, Heading1, ListChecks, Code, Image as ImageIcon, Star, Archive, Copy } from "lucide-react";
import { marked } from "marked";
import { notesApi } from "@/lib/api/client";

type ViewMode = "edit" | "preview" | "split";

const SNIPPETS: Record<string, string> = {
  h1: "\n# Título\n",
  checklist: "\n- [ ] Novo item\n",
  code: "\n```\ncódigo aqui\n```\n",
  image: "\n![descrição](https://exemplo.com/imagem.png)\n",
};

const NOTE_TEMPLATES: Record<string, string> = {
  Resumo: "# Resumo\n\n## Pontos principais\n- \n\n## Conclusão\n",
  Reunião: "# Reunião — \n\n**Data:** \n**Participantes:** \n\n## Notas\n\n## Ações\n- [ ] \n",
  Aula: "# Aula — \n\n## Tópicos\n\n## Dúvidas\n",
  Brainstorm: "# Brainstorm — \n\n## Ideias\n- \n",
  Checklist: "# Checklist — \n\n- [ ] \n- [ ] \n",
};

export default function NotasPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"" | "A guardar…" | "Guardado">("");
  const [mode, setMode] = useState<ViewMode>("split");
  const debounceRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function load() {
    notesApi.list().then((data: any) => setNotes(data));
  }
  useEffect(() => { load(); }, []);

  function openNote(note: any) {
    setActiveId(note.id);
    setTitle(note.title);
    setContent(note.content);
  }

  async function createNote(template?: string) {
    const note: any = await notesApi.create({
      title: template || "Sem título",
      content: template ? NOTE_TEMPLATES[template] : "",
    });
    await load();
    openNote(note);
  }

  async function toggleFavorite(note: any, e: React.MouseEvent) {
    e.stopPropagation();
    await notesApi.update(note.id, { is_favorite: !note.is_favorite });
    load();
  }

  async function archiveNote(note: any, e: React.MouseEvent) {
    e.stopPropagation();
    await notesApi.update(note.id, { archived: true });
    if (activeId === note.id) setActiveId(null);
    load();
  }

  async function duplicateNote(note: any, e: React.MouseEvent) {
    e.stopPropagation();
    const full: any = notes.find((n) => n.id === note.id);
    const created: any = await notesApi.create({ title: `Cópia de ${full.title}`, content: full.content });
    load();
    openNote(created);
  }

  function scheduleSave(field: "title" | "content", value: string) {
    setStatus("A guardar…");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!activeId) return;
      await notesApi.update(activeId, { [field]: value });
      setStatus("Guardado");
      load();
    }, 600); // autosave com debounce
  }

  function onChange(field: "title" | "content", value: string) {
    if (field === "title") setTitle(value); else setContent(value);
    scheduleSave(field, value);
  }

  function insertSnippet(key: string) {
    const snippet = SNIPPETS[key];
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const next = content.slice(0, start) + snippet + content.slice(start);
    onChange("content", next);
  }

  function toggleChecklistLine(lineIndex: number) {
    const lines = content.split("\n");
    const line = lines[lineIndex];
    if (line.includes("- [ ]")) lines[lineIndex] = line.replace("- [ ]", "- [x]");
    else if (line.includes("- [x]")) lines[lineIndex] = line.replace("- [x]", "- [ ]");
    const next = lines.join("\n");
    onChange("content", next);
  }

  const lines = content.split("\n");

  return (
    <div className="flex h-[75vh] gap-4">
      <div className="w-56 shrink-0 space-y-1 overflow-y-auto border-r border-[rgb(var(--border))] pr-3">
        <div className="mb-2 flex items-center gap-1">
          <button onClick={() => createNote()} className="flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-focus hover:bg-focus/10">
            <Plus size={14} /> Nova nota
          </button>
          <select
            onChange={(e) => { if (e.target.value) createNote(e.target.value); e.target.value = ""; }}
            className="rounded-md bg-transparent text-xs text-muted outline-none"
            defaultValue=""
          >
            <option value="" disabled>Modelo</option>
            {Object.keys(NOTE_TEMPLATES).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {notes.map((n) => (
          <div
            key={n.id} onClick={() => openNote(n)}
            className={`group flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-left text-sm cursor-pointer ${
              activeId === n.id ? "bg-focus/10 text-focus" : "text-muted hover:bg-[rgb(var(--border))]/30"
            }`}
          >
            <FileText size={13} className="shrink-0" /> <span className="flex-1 truncate">{n.title || "Sem título"}</span>
            <button onClick={(e) => toggleFavorite(n, e)} className="opacity-0 group-hover:opacity-100">
              <Star size={11} className={n.is_favorite ? "fill-signal text-signal opacity-100" : ""} />
            </button>
            <button onClick={(e) => duplicateNote(n, e)} className="opacity-0 group-hover:opacity-100"><Copy size={11} /></button>
            <button onClick={(e) => archiveNote(n, e)} className="opacity-0 group-hover:opacity-100"><Archive size={11} /></button>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {activeId ? (
          <>
            <div className="mb-2 flex items-center justify-between">
              <input
                value={title} onChange={(e) => onChange("title", e.target.value)}
                className="flex-1 bg-transparent text-2xl font-semibold outline-none"
              />
              <div className="flex items-center gap-1">
                <button onClick={() => insertSnippet("h1")} title="Título" className="rounded p-1.5 text-muted hover:bg-[rgb(var(--border))]/40"><Heading1 size={14} /></button>
                <button onClick={() => insertSnippet("checklist")} title="Checklist" className="rounded p-1.5 text-muted hover:bg-[rgb(var(--border))]/40"><ListChecks size={14} /></button>
                <button onClick={() => insertSnippet("code")} title="Código" className="rounded p-1.5 text-muted hover:bg-[rgb(var(--border))]/40"><Code size={14} /></button>
                <button onClick={() => insertSnippet("image")} title="Imagem" className="rounded p-1.5 text-muted hover:bg-[rgb(var(--border))]/40"><ImageIcon size={14} /></button>
                <div className="mx-1 h-4 w-px bg-[rgb(var(--border))]" />
                <button onClick={() => setMode("edit")} className={`rounded p-1.5 ${mode === "edit" ? "text-focus" : "text-muted"}`}><Pencil size={14} /></button>
                <button onClick={() => setMode("split")} className={`rounded p-1.5 ${mode === "split" ? "text-focus" : "text-muted"}`}><Columns2 size={14} /></button>
                <button onClick={() => setMode("preview")} className={`rounded p-1.5 ${mode === "preview" ? "text-focus" : "text-muted"}`}><Eye size={14} /></button>
              </div>
            </div>

            <div className="flex flex-1 gap-4 overflow-hidden">
              {mode !== "preview" && (
                <textarea
                  ref={textareaRef}
                  value={content} onChange={(e) => onChange("content", e.target.value)}
                  placeholder="Escreve em Markdown… usa os botões acima para títulos, checklists, código e imagens."
                  className={`${mode === "split" ? "w-1/2" : "w-full"} resize-none bg-transparent text-sm outline-none placeholder:text-muted font-mono`}
                />
              )}
              {mode !== "edit" && (
                <div className={`${mode === "split" ? "w-1/2 border-l border-[rgb(var(--border))] pl-4" : "w-full"} overflow-y-auto`}>
                  {/* checklists são renderizadas com checkboxes clicáveis; resto em markdown */}
                  <div className="prose prose-sm max-w-none">
                    {lines.map((line, idx) => {
                      const isChecklist = /- \[( |x)\]/.test(line);
                      if (isChecklist) {
                        const checked = line.includes("- [x]");
                        const text = line.replace(/- \[( |x)\]\s*/, "");
                        return (
                          <label key={idx} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={checked} onChange={() => toggleChecklistLine(idx)} />
                            <span className={checked ? "line-through opacity-50" : ""}>{text}</span>
                          </label>
                        );
                      }
                      return (
                        <div key={idx} className="text-sm" dangerouslySetInnerHTML={{ __html: marked.parseInline(line || "&nbsp;") as string }} />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-muted">{status}</p>
          </>
        ) : (
          <p className="text-sm text-muted">Seleciona ou cria uma nota.</p>
        )}
      </div>
    </div>
  );
}
