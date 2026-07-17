"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { calendarApi } from "@/lib/api/client";

function getMonthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // semana começa à segunda
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function AgendaPage() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const today = new Date();
  const [year] = useState(today.getFullYear());
  const [month] = useState(today.getMonth());

  function load() {
    calendarApi.merged().then(setItems);
  }
  useEffect(() => { load(); }, []);

  async function addEvent() {
    if (!title.trim() || !date) return;
    await calendarApi.create({ title, start_time: new Date(date).toISOString() });
    setTitle(""); setDate("");
    load();
  }

  const cells = getMonthMatrix(year, month);
  const byDay: Record<number, any[]> = {};
  items.forEach((i) => {
    const d = new Date(i.start);
    if (d.getFullYear() === year && d.getMonth() === month) {
      byDay[d.getDate()] = [...(byDay[d.getDate()] || []), i];
    }
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Agenda</h1>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2">
        <Plus size={15} className="text-muted" />
        <input
          value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Novo evento…" className="flex-1 min-w-[140px] bg-transparent text-sm outline-none"
        />
        <input
          type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-md bg-transparent text-xs text-muted outline-none"
        />
        <button onClick={addEvent} className="rounded-md bg-focus/15 px-2.5 py-1 text-xs text-focus">Adicionar</button>
      </div>

      <p className="text-sm text-muted capitalize">
        {today.toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
      </p>

      <div className="grid grid-cols-7 gap-1.5 text-xs">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
          <div key={d} className="pb-1 text-center text-muted">{d}</div>
        ))}
        {cells.map((day, idx) => (
          <div
            key={idx}
            className={`min-h-[72px] rounded-lg border border-[rgb(var(--border))] p-1.5 ${
              day === today.getDate() ? "bg-focus/5 border-focus/40" : "bg-surface"
            }`}
          >
            {day && <span className="text-muted">{day}</span>}
            {day && byDay[day]?.slice(0, 2).map((ev) => (
              <div key={ev.id} className="mt-1 truncate rounded bg-signal/15 px-1 py-0.5 text-[10px] text-signal">
                {ev.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
