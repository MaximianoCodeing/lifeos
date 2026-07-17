"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Trash2 } from "lucide-react";
import { libraryApi } from "@/lib/api/client";

const ACTIONS = [
  { value: "guardar", label: "Guardar documento" },
  { value: "resumir", label: "Criar resumo" },
  { value: "flashcards", label: "Criar flashcards" },
  { value: "checklist", label: "Criar checklist" },
];

export default function BibliotecaPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function load() {
    libraryApi.list().then(setDocs);
  }
  useEffect(() => { load(); }, []);

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
  }

  async function confirmAction(action: string) {
    if (!pendingFile) return;
    const res = await libraryApi.upload(pendingFile, action);
    setResult(res);
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = "";
    load();
  }

  async function removeDoc(id: string) {
    await libraryApi.remove(id);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Biblioteca</h1>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[rgb(var(--border))] bg-surface p-6 text-sm text-muted hover:border-focus/50">
        <Upload size={16} /> Carregar ficheiro (PDF, Word, Excel, PowerPoint, imagem, texto)
        <input ref={inputRef} type="file" className="hidden" onChange={onFileSelected} />
      </label>

      {pendingFile && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
          <p className="text-sm">"{pendingFile.name}" — o que pretendes fazer?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ACTIONS.map((a) => (
              <button key={a.value} onClick={() => confirmAction(a.value)}
                className="rounded-lg bg-focus/15 px-3 py-1.5 text-xs text-focus hover:bg-focus/25">
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {result && (result.summary || result.flashcards_raw || result.checklist_raw) && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4 text-sm whitespace-pre-line">
          {result.summary || result.flashcards_raw || result.checklist_raw}
        </div>
      )}

      <div className="space-y-1.5">
        {docs.map((d) => (
          <div key={d.id} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2.5">
            <FileText size={15} className="text-muted" />
            <span className="flex-1 truncate text-sm">{d.filename}</span>
            <span className="rounded-full border border-[rgb(var(--border))] px-2 py-0.5 text-xs text-muted">{d.file_type}</span>
            <button onClick={() => removeDoc(d.id)} className="text-muted hover:text-red-500">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {docs.length === 0 && <p className="text-sm text-muted">Biblioteca vazia.</p>}
      </div>
    </div>
  );
}
