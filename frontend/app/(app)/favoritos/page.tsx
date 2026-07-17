"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { overviewApi } from "@/lib/api/client";

export default function FavoritosPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { overviewApi.favorites().then(setItems); }, []);

  return (
    <div className="space-y-4">
      <h1 className="flex items-center gap-2 text-xl font-semibold"><Star size={18} className="text-signal" /> Favoritos</h1>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2.5">
            <span className="rounded-full border border-[rgb(var(--border))] px-2 py-0.5 text-xs text-muted">{item.type}</span>
            <span className="flex-1 truncate text-sm">{item.title}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">Ainda não marcaste nada como favorito.</p>}
      </div>
    </div>
  );
}
