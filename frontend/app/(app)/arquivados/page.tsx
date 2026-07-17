"use client";

import { useEffect, useState } from "react";
import { Archive, RotateCcw } from "lucide-react";
import { overviewApi, tasksApi, projectsApi, notesApi } from "@/lib/api/client";

export default function ArquivadosPage() {
  const [items, setItems] = useState<any[]>([]);

  function load() { overviewApi.archived().then(setItems); }
  useEffect(() => { load(); }, []);

  async function unarchive(type: string, id: string) {
    if (type === "tarefa") await tasksApi.update(id, { archived: false });
    if (type === "projeto") await projectsApi.update(id, { archived: false });
    if (type === "nota") await notesApi.update(id, { archived: false });
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="flex items-center gap-2 text-xl font-semibold"><Archive size={18} /> Arquivados</h1>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2.5">
            <span className="rounded-full border border-[rgb(var(--border))] px-2 py-0.5 text-xs text-muted">{item.type}</span>
            <span className="flex-1 truncate text-sm">{item.title}</span>
            <button onClick={() => unarchive(item.type, item.id)} title="Desarquivar" className="text-muted hover:text-focus">
              <RotateCcw size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">Nada arquivado.</p>}
      </div>
    </div>
  );
}
