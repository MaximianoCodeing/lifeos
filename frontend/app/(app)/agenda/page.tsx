"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { calendarApi, tasksApi } from "@/lib/api/client";

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

  // Remove tanto eventos como tarefas com data, consoante a origem do item
  async function removeItem(item: any) {
    if (item.source === "event") await calendarApi.remove(item.id);
    else await tasksApi.remove(item.id);
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

  const monthItems = items
    .filter((i) => new Date(i.start).getFullYear() === year && new Date(i.start).getMonth() === month)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

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
            {day && byDay[day]?.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                className="group mt-1 flex items-center gap-1 truncate rounded bg-signal/15 px-1 py-0.5 text-[10px] text-signal"
              >
                <span className="flex-1 truncate">{ev.title}</span>
                <button
                  onClick={() => removeItem(ev)}
                  className="hidden shrink-0 group-hover:block hover:text-red-500"
                  title="Remover"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium">Este mês</p>
        {monthItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2 text-sm">
            <span className={`rounded-full border border-[rgb(var(--border))] px-2 py-0.5 text-[10px] text-muted`}>
              {item.source === "event" ? "evento" : "tarefa"}
            </span>
            <span className="flex-1 truncate">{item.title}</span>
            <span className="text-xs text-muted">{new Date(item.start).toLocaleDateString("pt-PT")}</span>
            <button onClick={() => removeItem(item)} className="text-muted hover:text-red-500">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {monthItems.length === 0 && <p className="text-sm text-muted">Nada agendado este mês.</p>}
      </div>
    </div>
  );
}
