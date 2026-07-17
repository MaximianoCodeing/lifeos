"use client";

import { useEffect, useState } from "react";
import { Sun, Calendar, CheckSquare, Repeat, Layers, Target, Timer } from "lucide-react";
import { overviewApi, authApi } from "@/lib/api/client";

export default function HojePage() {
  const [data, setData] = useState<any>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    overviewApi.today().then(setData).catch(() => {});
    authApi.me().then((u: any) => setUserName(u.name?.split(" ")[0] || "")).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 19 ? "Boa tarde" : "Boa noite";

  if (!data) return <p className="text-sm text-muted">A carregar…</p>;

  const summary = `Hoje tens ${data.tasks_today.length} tarefas, ${data.events_today.length} eventos e ${data.flashcards_due} flashcards para rever.`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl">
          <Sun size={20} className="text-signal" /> {greeting}{userName ? `, ${userName}` : ""}.
        </h1>
        <p className="mt-1 text-sm text-muted">{summary}</p>
      </div>

      <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Progresso do dia</span>
          <span>{data.daily_progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[rgb(var(--border))]">
          <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${data.daily_progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-medium"><CheckSquare size={14} className="text-focus" /> Tarefas de hoje</h2>
          {data.tasks_today.length === 0 && <p className="text-xs text-muted">Sem tarefas para hoje.</p>}
          {data.tasks_today.map((t: any) => (
            <p key={t.id} className={`text-sm ${t.status === "concluida" ? "line-through opacity-50" : ""}`}>{t.title}</p>
          ))}
        </div>

        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-medium"><Calendar size={14} className="text-focus" /> Eventos de hoje</h2>
          {data.events_today.length === 0 && <p className="text-xs text-muted">Sem eventos para hoje.</p>}
          {data.events_today.map((e: any) => (
            <p key={e.id} className="text-sm">{e.title}</p>
          ))}
        </div>

        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-medium"><Repeat size={14} className="text-focus" /> Hábitos pendentes</h2>
          {data.habits_pending.length === 0 && <p className="text-xs text-muted">Todos marcados hoje 🎉</p>}
          {data.habits_pending.map((h: any) => (
            <p key={h.id} className="text-sm">{h.name}</p>
          ))}
        </div>

        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-medium"><Layers size={14} className="text-focus" /> Flashcards para hoje</h2>
          <p className="text-2xl font-semibold">{data.flashcards_due}</p>
        </div>

        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-medium"><Target size={14} className="text-focus" /> Objetivos em progresso</h2>
          {data.goals_in_progress.length === 0 && <p className="text-xs text-muted">Sem objetivos em progresso.</p>}
          {data.goals_in_progress.map((g: any) => (
            <p key={g.id} className="text-sm">{g.title} — {g.progress}%</p>
          ))}
        </div>

        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-medium"><Timer size={14} className="text-focus" /> Tempo produtivo hoje</h2>
          <p className="text-2xl font-semibold">{data.focus_minutes_today} min</p>
        </div>
      </div>
    </div>
  );
}
