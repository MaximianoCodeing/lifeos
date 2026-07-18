"use client";

import { useEffect, useState } from "react";
import { statsApi } from "@/lib/api/client";

export default function EstatisticasPage() {
  const [overview, setOverview] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);

  useEffect(() => {
    statsApi.overview().then(setOverview);
    statsApi.monthly().then(setMonthly);
  }, []);

  const max = Math.max(1, ...monthly.map((m) => m.pomodoros));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Estatísticas</h1>

      {overview && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ["Tarefas concluídas", overview.completed_tasks],
            ["Pomodoros", overview.total_pomodoros],
            ["Minutos de foco", overview.focus_minutes],
            ["Hábitos ativos", overview.active_habits],
            ["Progresso médio objetivos", `${overview.avg_goal_progress}%`],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
              <p className="text-xs text-muted">{label}</p>
              <p className="mt-2 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
        <p className="mb-3 text-sm font-medium">Pomodoros (últimos 30 dias)</p>
        <div className="flex h-32 items-end gap-1">
          {monthly.map((m) => (
            <div key={m.date} title={`${m.date}: ${m.pomodoros}`}
              className="flex-1 rounded-t bg-signal/60"
              style={{ height: `${(m.pomodoros / max) * 100}%` }} />
          ))}
          {monthly.length === 0 && <p className="text-xs text-muted">Sem dados ainda.</p>}
        </div>
      </div>
    </div>
  );
}
