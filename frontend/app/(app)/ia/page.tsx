"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { aiApi } from "@/lib/api/client";

export default function IAPage() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Olá! Sou o teu assistente pessoal no LifeOS. Pergunta-me o que quiseres." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const question = input;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    const res = await aiApi.ask(question);
    setMessages((m) => [...m, { role: "ai", text: res.answer }]);
    setLoading(false);
  }

  return (
    <div className="flex h-[75vh] flex-col">
      <h1 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <Sparkles size={18} className="text-signal" /> IA
      </h1>
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-md rounded-xl px-3.5 py-2.5 text-sm ${
            m.role === "user" ? "ml-auto bg-focus/15 text-focus" : "bg-surface border border-[rgb(var(--border))]"
          }`}>
            {m.text}
          </div>
        ))}
        {loading && <p className="text-xs text-muted">A pensar…</p>}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-surface px-3 py-2">
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Pergunta ao teu assistente…"
          className="flex-1 bg-transparent text-sm outline-none"
        />
        <button onClick={send}><Send size={15} className="text-focus" /></button>
      </div>
    </div>
  );
}
