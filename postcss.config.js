"use client";

import { useEffect, useState } from "react";
import { Plus, Star, Archive, Copy, FolderKanban, Trash2 } from "lucide-react";
import { projectsApi } from "@/lib/api/client";
import { EmptyState } from "@/components/ui/empty-state";

const COLORS = ["#5B6EF5", "#C9A227", "#16A34A", "#EA580C", "#DC2626", "#9333EA"];
const ICONS = ["🚀", "📚", "💼", "🏠", "🎯", "💡"];
const TEMPLATES = ["Universidade", "Programação", "Trabalho", "Pessoal"];

export default function ProjetosPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [loading, setLoading] = useState(true);

  function load() {
    projectsApi.list().then((data: any) => { setProjects(data); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function addProject() {
    if (!name.trim()) return;
    await projectsApi.create({ name, color, icon });
    setName("");
    load();
  }

  function applyTemplate(t: string) { setName(`${t} — `); }

  async function updateProgress(id: string, progress: number) {
    await projectsApi.update(id, { progress });
    load();
  }

  async function toggleFavorite(p: any) {
    await projectsApi.update(p.id, { is_favorite: !p.is_favorite });
    load();
  }

  async function archiveProject(id: string) {
    await projectsApi.update(id, { archived: true });
    load();
  }

  async function duplicateProject(p: any) {
    await projectsApi.create({ name: `Cópia de ${p.name}`, description: p.description, color: p.color, icon: p.icon });
    load();
  }

  async function removeProject(id: string) {
    await projectsApi.remove(id);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Projetos</h1>

      <div className="space-y-2 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2">
        <div className="flex items-center gap-2">
          <Plus size={15} className="text-muted" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addProject()}
            placeholder="Novo projeto… (Enter para adicionar)"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 pl-6 text-xs text-muted">
          <div className="flex gap-1">
            {ICONS.map((i) => (
              <button key={i} onClick={() => setIcon(i)} className={`rounded px-1 ${icon === i ? "bg-focus/15" : ""}`}>{i}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} className="h-4 w-4 rounded-full border-2" style={{ backgroundColor: c, borderColor: color === c ? c : "transparent" }} />
            ))}
          </div>
          <div className="flex gap-1">
            {TEMPLATES.map((t) => (
              <button key={t} onClick={() => applyTemplate(t)} className="rounded-full border border-[rgb(var(--border))] px-2 py-0.5">{t}</button>
            ))}
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-muted">A carregar…</p>}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {projects.map((p) => (
          <div key={p.id} className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4" style={{ borderLeftWidth: 3, borderLeftColor: p.color || "transparent" }}>
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium">{p.icon} {p.name}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleFavorite(p)}><Star size={13} className={p.is_favorite ? "fill-signal text-signal" : "text-muted"} /></button>
                <button onClick={() => duplicateProject(p)} className="text-muted hover:text-focus"><Copy size={13} /></button>
                <button onClick={() => archiveProject(p.id)} className="text-muted hover:text-focus"><Archive size={13} /></button>
                <button onClick={() => removeProject(p.id)} className="text-muted hover:text-red-500"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--border))]">
              <div className="h-full rounded-full" style={{ width: `${p.progress}%`, backgroundColor: p.color || "#C9A227" }} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted">{p.progress}% concluído</p>
              <input
                type="range" min={0} max={100} value={p.progress}
                onChange={(e) => updateProgress(p.id, Number(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        ))}
        {!loading && projects.length === 0 && (
          <div className="md:col-span-2">
            <EmptyState icon={FolderKanban} title="Sem projetos ainda" description="Agrupa as tuas tarefas num projeto para veres o progresso." />
          </div>
        )}
      </div>
    </div>
  );
}
