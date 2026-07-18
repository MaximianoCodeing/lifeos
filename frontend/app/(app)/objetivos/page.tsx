"use client";

import { useEffect, useState } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { goalsApi, aiApi } from "@/lib/api/client";

const COLORS = ["#5B6EF5", "#C9A227", "#16A34A", "#EA580C", "#DC2626", "#9333EA"];
const ICONS = ["🎯", "📈", "🏆", "💪", "🧠", "✨"];

export default function ObjetivosPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [plans, setPlans] = useState<Record<string, string>>({});

  function load() {
    goalsApi.list().then(setGoals);
  }
  useEffect(() => { load(); }, []);

  async function addGoal() {
    if (!title.trim()) return;
    await goalsApi.create({ title, color, icon });
    setTitle("");
    load();
  }

  async function updateProgress(id: string, progress: number) {
    await goalsApi.update(id, { progress });
    load();
  }

  async function suggestPlan(goal: any) {
    const res = await aiApi.plan(goal.title);
    setPlans((p) => ({ ...p, [goal.id]: res.plan }));
  }

  async function removeGoal(id: string) {
    await goalsApi.remove(id);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Objetivos</h1>

      <div className="space-y-2 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2">
        <div className="flex items-center gap-2">
          <Plus size={15} className="text-muted" />
          <input
            value={title} onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            placeholder="Novo objetivo… (Enter para adicionar)"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-3 pl-6 text-xs text-muted">
          <div className="flex gap-1">
            {ICONS.map((i) => <button key={i} onClick={() => setIcon(i)} className={`rounded px-1 ${icon === i ? "bg-focus/15" : ""}`}>{i}</button>)}
          </div>
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} className="h-4 w-4 rounded-full border-2" style={{ backgroundColor: c, borderColor: color === c ? c : "transparent" }} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {goals.map((g) => (
          <div key={g.id} className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4" style={{ borderLeftWidth: 3, borderLeftColor: g.color || "transparent" }}>
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium">{g.icon} {g.title}</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => suggestPlan(g)} className="flex items-center gap-1 text-xs text-focus hover:underline">
                  <Sparkles size={12} /> Plano com IA
                </button>
                <button onClick={() => removeGoal(g.id)} className="text-muted hover:text-red-500">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--border))]">
              <div className="h-full rounded-full" style={{ width: `${g.progress}%`, backgroundColor: g.color || "#C9A227" }} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted">{g.progress}%{g.deadline ? ` · prazo ${g.deadline}` : ""}</p>
              <input type="range" min={0} max={100} value={g.progress}
                onChange={(e) => updateProgress(g.id, Number(e.target.value))} className="w-24" />
            </div>
            {plans[g.id] && <p className="mt-3 whitespace-pre-line text-xs text-muted">{plans[g.id]}</p>}
          </div>
        ))}
        {goals.length === 0 && <p className="text-sm text-muted">Sem objetivos ainda.</p>}
      </div>
    </div>
  );
}
