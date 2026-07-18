"use client";

import { useEffect, useState } from "react";
import { Plus, Check, Trash2, Star, Archive, Copy, CheckSquare } from "lucide-react";
import { tasksApi } from "@/lib/api/client";
import { EmptyState } from "@/components/ui/empty-state";

const PRIORITY_COLOR: Record<string, string> = {
  alta: "text-red-500", media: "text-amber-500", baixa: "text-emerald-500",
};

const TEMPLATES: Record<string, { title: string; category: string }> = {
  Estudo: { title: "Rever matéria de ", category: "Estudo" },
  Trabalho: { title: "Concluir tarefa de ", category: "Trabalho" },
  Universidade: { title: "Entregar trabalho de ", category: "Universidade" },
  Casa: { title: "Organizar ", category: "Casa" },
  Projeto: { title: "Avançar no projeto ", category: "Projeto" },
};

export default function TarefasPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("media");
  const [template, setTemplate] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    tasksApi.list().then((data: any) => { setTasks(data); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function addTask() {
    if (!title.trim()) return;
    const category = template ? TEMPLATES[template].category : undefined;
    await tasksApi.create({ title, priority, category });
    setTitle(""); setTemplate("");
    load();
  }

  async function toggleDone(task: any) {
    const status = task.status === "concluida" ? "pendente" : "concluida";
    await tasksApi.update(task.id, { status, progress: status === "concluida" ? 100 : 0 });
    load();
  }

  async function toggleFavorite(task: any) {
    await tasksApi.update(task.id, { is_favorite: !task.is_favorite });
    load();
  }

  async function archiveTask(id: string) {
    await tasksApi.update(id, { archived: true });
    load();
  }

  async function duplicateTask(task: any) {
    await tasksApi.create({
      title: `Cópia de ${task.title}`, priority: task.priority, category: task.category,
      tags: task.tags, checklist: task.checklist,
    });
    load();
  }

  async function removeTask(id: string) {
    await tasksApi.remove(id);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Tarefas</h1>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2">
        <Plus size={15} className="text-muted" />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Nova tarefa… (Enter para adicionar)"
          className="flex-1 min-w-[140px] bg-transparent text-sm outline-none"
        />
        <select value={template} onChange={(e) => setTemplate(e.target.value)} className="rounded-md bg-transparent text-xs text-muted outline-none">
          <option value="">Modelo…</option>
          {Object.keys(TEMPLATES).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-md bg-transparent text-xs text-muted outline-none"
        >
          <option value="baixa">baixa</option>
          <option value="media">média</option>
          <option value="alta">alta</option>
        </select>
      </div>

      {loading && <p className="text-sm text-muted">A carregar…</p>}

      <div className="space-y-1.5">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2.5">
            <button
              onClick={() => toggleDone(t)}
              className={`flex h-4 w-4 items-center justify-center rounded border ${
                t.status === "concluida" ? "bg-focus border-focus" : "border-[rgb(var(--border))]"
              }`}
            >
              {t.status === "concluida" && <Check size={11} className="text-white" />}
            </button>
            <span className={`flex-1 text-sm ${t.status === "concluida" ? "line-through opacity-50" : ""}`}>
              {t.title}
            </span>
            <span className={`text-xs ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
            {t.due_date && <span className="text-xs text-muted">{t.due_date}</span>}
            <button onClick={() => toggleFavorite(t)} title="Favorito">
              <Star size={14} className={t.is_favorite ? "fill-signal text-signal" : "text-muted"} />
            </button>
            <button onClick={() => duplicateTask(t)} title="Duplicar" className="text-muted hover:text-focus">
              <Copy size={14} />
            </button>
            <button onClick={() => archiveTask(t.id)} title="Arquivar" className="text-muted hover:text-focus">
              <Archive size={14} />
            </button>
            <button onClick={() => removeTask(t.id)} title="Eliminar" className="text-muted hover:text-red-500">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {!loading && tasks.length === 0 && (
          <EmptyState icon={CheckSquare} title="Sem tarefas ainda" description="Cria a primeira tarefa para começares a organizar o teu dia." />
        )}
      </div>
    </div>
  );
}
