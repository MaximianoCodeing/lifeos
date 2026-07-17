"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { trashApi } from "@/lib/api/client";

export default function LixeiraPage() {
  const [items, setItems] = useState<any[]>([]);

  function load() { trashApi.list().then(setItems); }
  useEffect(() => { load(); }, []);

  async function restore(type: string, id: string) {
    await trashApi.restore(type, id);
    load();
  }

  async function purge(type: string, id: string) {
    await trashApi.purge(type, id);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Lixeira</h1>
      <p className="text-sm text-muted">Itens eliminados ficam aqui antes de serem apagados definitivamente.</p>

      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2.5">
            <span className="rounded-full border border-[rgb(var(--border))] px-2 py-0.5 text-xs text-muted">{item.type}</span>
            <span className="flex-1 truncate text-sm">{item.name}</span>
            <button onClick={() => restore(item.type, item.id)} title="Restaurar" className="text-muted hover:text-focus">
              <RotateCcw size={14} />
            </button>
            <button onClick={() => purge(item.type, item.id)} title="Eliminar definitivamente" className="text-muted hover:text-red-500">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">Lixeira vazia.</p>}
      </div>
    </div>
  );
}
