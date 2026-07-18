"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, CheckSquare, Calendar, Repeat, Layers, Timer } from "lucide-react";
import { dashboardApi, overviewApi, notesApi, projectsApi } from "@/lib/api/client";
import { CardSkeletonGrid, Skeleton } from "@/components/ui/skeleton";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 19) return "Boa tarde";
  return "Boa noite";
}

const ALL_WIDGETS = [
  { key: "next_tasks", label: "Próximas tarefas" },
  { key: "next_events", label: "Próximos eventos" },
  { key: "habits_today", label: "Hábitos de hoje" },
  { key: "goals", label: "Objetivos" },
  { key: "pomodoros", label: "Pomodoros hoje" },
];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [today, setToday] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(ALL_WIDGETS.map((w) => w.key));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.get().then((d: any) => {
      setData(d);
      if (d?.preferences?.dashboard_widgets) setVisibleWidgets(d.preferences.dashboard_widgets);
    }).catch((e) => setError(e.message));
    overviewApi.today().then(setToday).catch(() => {});
    overviewApi.favorites().then((f: any) => setFavorites(f.slice(0, 5))).catch(() => {});
    notesApi.list().then((n: any) => setRecentNotes(n.slice(0, 3))).catch(() => {});
    projectsApi.list().then((p: any) => setRecentProjects(p.slice(0, 3))).catch(() => {});
  }, []);

  function toggleWidget(key: string) {
    setVisibleWidgets((prev) => (prev.includes(key) ? prev.filter((w) => w !== key) : [...prev, key]));
  }

  const todayStr = new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" });
  const userFirstName = "";

  const widgetContent: Record<string, { value: string; detail: string; icon: any }> = data
    ? {
        next_tasks: { value: `${data.next_tasks.length} pendentes`, detail: data.next_tasks[0]?.title || "Sem tarefas", icon: CheckSquare },
        next_events: { value: `${data.next_events.length}`, detail: data.next_events[0]?.title || "Sem eventos", icon: Calendar },
        habits_today: { value: `${data.habits_today.filter((h: any) => h.done_today).length} de ${data.habits_today.length}`, detail: data.habits_today.map((h: any) => h.name).join(", ") || "Sem hábitos", icon: Repeat },
        goals: { value: `${data.goals.length}`, detail: data.goals[0]?.title || "Sem objetivos", icon: Star },
        pomodoros: { value: `${data.pomodoros_today}`, detail: "concluídos", icon: Timer },
      }
    : {};

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl tracking-tight">{getGreeting()}{userFirstName ? `, ${userFirstName}` : ""}.</h1>
        <p className="text-muted mt-1.5 capitalize">{todayStr}</p>
      </div>

      {/* Cartão principal — Plano de Hoje */}
      <Link href="/hoje" className="block">
        <div className="group relative overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-surface p-6 shadow-soft transition-all duration-300 ease-smooth hover:shadow-soft-lg hover:-translate-y-0.5 md:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-focus/[0.06] blur-3xl" />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-wider text-focus">Plano de Hoje</p>
            {today ? (
              <>
                <p className="mt-3 max-w-md text-lg text-[rgb(var(--text-primary))]">
                  Tens <strong>{today.tasks_today.length} tarefas</strong>, <strong>{today.events_today.length} eventos</strong> e{" "}
                  <strong>{today.flashcards_due} flashcards</strong> para rever.
                </p>
                <div className="mt-5 flex flex-wrap gap-6 text-sm text-muted">
                  <span className="flex items-center gap-1.5"><CheckSquare size={14} /> {today.tasks_today.length} tarefas</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {today.events_today.length} eventos</span>
                  <span className="flex items-center gap-1.5"><Repeat size={14} /> {today.habits_pending.length} hábitos pendentes</span>
                  <span className="flex items-center gap-1.5"><Layers size={14} /> {today.flashcards_due} flashcards</span>
                  <span className="flex items-center gap-1.5"><Timer size={14} /> {today.focus_minutes_today} min hoje</span>
                </div>
                <div className="mt-5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[rgb(var(--border))]">
                  <div className="h-full rounded-full bg-signal transition-all duration-500 ease-smooth" style={{ width: `${today.daily_progress}%` }} />
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-5 w-72" />
                <Skeleton className="h-3 w-48" />
              </div>
            )}
          </div>
        </div>
      </Link>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {ALL_WIDGETS.map((w) => (
            <button
              key={w.key} onClick={() => toggleWidget(w.key)}
              className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${visibleWidgets.includes(w.key) ? "bg-focus/15 text-focus" : "border border-[rgb(var(--border))] text-muted hover:border-focus/30"}`}
            >
              {w.label}
            </button>
          ))}
        </div>

        {!data && !error ? (
          <CardSkeletonGrid count={5} />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {ALL_WIDGETS.filter((w) => visibleWidgets.includes(w.key)).map((w, i) => {
              const Icon = widgetContent[w.key]?.icon;
              return (
                <div
                  key={w.key}
                  className={`group rounded-2xl border border-[rgb(var(--border))] bg-surface p-5 shadow-soft transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-soft-lg ${
                    i === 0 ? "col-span-2 row-span-1" : "col-span-1"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-medium text-muted">{w.label}</h2>
                    {Icon && <Icon size={14} className="text-focus opacity-60" />}
                  </div>
                  <p className="mt-4 text-2xl font-semibold tracking-tight">{widgetContent[w.key]?.value}</p>
                  <p className="mt-1 truncate text-sm text-muted">{widgetContent[w.key]?.detail}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {favorites.length > 0 && (
        <div>
          <h2 className="mb-2.5 flex items-center gap-2 text-sm font-medium"><Star size={14} className="text-signal" /> Favoritos</h2>
          <div className="flex flex-wrap gap-2">
            {favorites.map((f) => (
              <span key={`${f.type}-${f.id}`} className="rounded-full border border-[rgb(var(--border))] bg-surface px-3 py-1.5 text-xs shadow-soft transition-transform hover:-translate-y-0.5">
                {f.title}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2.5 text-sm font-medium text-muted">Últimas notas</h2>
          <div className="space-y-1.5">
            {recentNotes.map((n) => (
              <Link key={n.id} href="/notas" className="block rounded-xl border border-[rgb(var(--border))] bg-surface px-4 py-2.5 text-sm shadow-soft transition-all hover:-translate-y-0.5 hover:border-focus/30">
                {n.title || "Sem título"}
              </Link>
            ))}
            {recentNotes.length === 0 && <p className="text-xs text-muted">Sem notas ainda.</p>}
          </div>
        </div>
        <div>
          <h2 className="mb-2.5 text-sm font-medium text-muted">Últimos projetos</h2>
          <div className="space-y-1.5">
            {recentProjects.map((p) => (
              <Link key={p.id} href="/projetos" className="block rounded-xl border border-[rgb(var(--border))] bg-surface px-4 py-2.5 text-sm shadow-soft transition-all hover:-translate-y-0.5 hover:border-focus/30">
                {p.icon} {p.name}
              </Link>
            ))}
            {recentProjects.length === 0 && <p className="text-xs text-muted">Sem projetos ainda.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
