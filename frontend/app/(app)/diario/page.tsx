"use client";

import { useEffect, useState } from "react";
import { journalApi } from "@/lib/api/client";

const SCALE = [1, 2, 3, 4, 5];

export default function DiarioPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [productivity, setProductivity] = useState(3);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  function load() {
    journalApi.list().then(setEntries);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!text.trim()) return;
    setSaving(true);
    await journalApi.upsert({ entry_date: today, text, mood, energy, productivity });
    setText("");
    setSaving(false);
    load();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Diário</h1>

      <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4 space-y-3">
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Como foi o teu dia?"
          rows={4}
          className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <div className="flex flex-wrap gap-4 text-xs text-muted">
          {[["Humor", mood, setMood], ["Energia", energy, setEnergy], ["Produtividade", productivity, setProductivity]].map(
            ([label, value, setter]: any) => (
              <div key={label} className="flex items-center gap-2">
                <span>{label}:</span>
                {SCALE.map((n) => (
                  <button
                    key={n} onClick={() => setter(n)}
                    className={`h-5 w-5 rounded-full text-[10px] ${value === n ? "bg-focus text-white" : "bg-[rgb(var(--border))]"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )
          )}
        </div>
        <button onClick={save} disabled={saving} className="rounded-lg bg-focus px-4 py-2 text-sm text-white disabled:opacity-50">
          {saving ? "A guardar…" : "Guardar entrada de hoje"}
        </button>
      </div>

      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
            <p className="text-xs text-muted">{e.entry_date} · Humor {e.mood}/5 · Energia {e.energy}/5 · Produtividade {e.productivity}/5</p>
            <p className="mt-2 text-sm">{e.text}</p>
            {e.ai_summary && <p className="mt-2 text-xs italic text-focus">{e.ai_summary}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
