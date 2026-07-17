"use client";

import { useEffect, useState } from "react";
import { Plus, Flame } from "lucide-react";
import { habitsApi } from "@/lib/api/client";

export default function HabitosPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [name, setName] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  function load() {
    habitsApi.list().then(setHabits);
  }
  useEffect(() => { load(); }, []);

  async function addHabit() {
    if (!name.trim()) return;
    await habitsApi.create({ name });
    setName("");
    load();
  }

  async function checkIn(id: string) {
    await habitsApi.checkIn(id);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Hábitos</h1>

      <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2">
        <Plus size={15} className="text-muted" />
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
          placeholder="Novo hábito… (Enter para adicionar)"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {habits.map((h) => {
          const doneToday = h.history.includes(today);
          return (
            <div key={h.id} className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
              <div>
                <h3 className="text-sm font-medium">{h.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <Flame size={12} className="text-signal" /> {h.streak} dias seguidos
                </p>
              </div>
              <button
                onClick={() => checkIn(h.id)}
                disabled={doneToday}
                className={`rounded-lg px-3 py-1.5 text-xs ${doneToday ? "bg-emerald-500/15 text-emerald-500" : "bg-focus/15 text-focus hover:bg-focus/25"}`}
              >
                {doneToday ? "Feito hoje" : "Marcar hoje"}
              </button>
            </div>
          );
        })}
        {habits.length === 0 && <p className="text-sm text-muted">Sem hábitos ainda.</p>}
      </div>
    </div>
  );
}
