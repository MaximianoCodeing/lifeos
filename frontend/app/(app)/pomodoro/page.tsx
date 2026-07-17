"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { pomodoroApi } from "@/lib/api/client";

const DEFAULT_MINUTES = { focus: 25, short_break: 5, long_break: 15 };

function loadSavedMinutes() {
  if (typeof window === "undefined") return DEFAULT_MINUTES;
  try {
    const saved = localStorage.getItem("lifeos-pomodoro-durations");
    return saved ? { ...DEFAULT_MINUTES, ...JSON.parse(saved) } : DEFAULT_MINUTES;
  } catch {
    return DEFAULT_MINUTES;
  }
}

export default function PomodoroPage() {
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<"focus" | "short_break" | "long_break">("focus");
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    const saved = loadSavedMinutes();
    setMinutes(saved);
    setSeconds(saved.focus * 60);
  }, []);

  useEffect(() => {
    setSeconds(minutes[mode] * 60);
    setRunning(false);
  }, [mode, minutes]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            if (sessionId) pomodoroApi.stop(sessionId);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, sessionId]);

  function updateMinutes(field: keyof typeof minutes, value: number) {
    const next = { ...minutes, [field]: Math.max(1, Math.min(180, value)) };
    setMinutes(next);
    localStorage.setItem("lifeos-pomodoro-durations", JSON.stringify(next));
  }

  async function toggle() {
    if (!running) {
      try {
        const session: any = await pomodoroApi.start({ session_type: mode, duration_minutes: minutes[mode] });
        setSessionId(session.id);
      } catch {
        setSessionId(null); // continua a funcionar localmente mesmo sem backend
      }
    }
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    setSeconds(minutes[mode] * 60);
    setSessionId(null);
  }

  const totalSeconds = minutes[mode] * 60;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;

  const content = (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-2">
        {(["focus", "short_break", "long_break"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg px-3 py-1.5 text-xs ${mode === m ? "bg-focus/15 text-focus" : "text-muted"}`}
          >
            {m === "focus" ? "Foco" : m === "short_break" ? "Pausa curta" : "Pausa longa"} · {minutes[m]}min
          </button>
        ))}
        <button
          onClick={() => setShowSettings((s) => !s)}
          className={`rounded-lg p-1.5 ${showSettings ? "text-focus" : "text-muted"}`}
          title="Personalizar tempos"
        >
          <Settings size={14} />
        </button>
      </div>

      {showSettings && (
        <div className="flex gap-4 rounded-2xl border border-[rgb(var(--border))] glass px-5 py-3.5 text-xs shadow-soft animate-slide-up">
          {([
            ["focus", "Foco"],
            ["short_break", "Pausa curta"],
            ["long_break", "Pausa longa"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex flex-col items-center gap-1.5 text-muted">
              {label}
              <input
                type="number" min={1} max={180}
                value={minutes[key]}
                onChange={(e) => updateMinutes(key, Number(e.target.value))}
                className="w-16 rounded-lg border border-[rgb(var(--border))] bg-transparent px-2 py-1.5 text-center text-sm text-[rgb(var(--text-primary))] outline-none focus:border-focus"
              />
              <span>min</span>
            </label>
          ))}
        </div>
      )}

      <div className="relative flex h-64 w-64 items-center justify-center md:h-72 md:w-72">
        <div className="absolute inset-0 rounded-full bg-signal/[0.04] blur-2xl" />
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" strokeWidth="3" className="stroke-[rgb(var(--border))]" />
          <circle
            cx="50" cy="50" r="45" fill="none" strokeWidth="3" stroke="#C9A227" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span className="font-display text-6xl font-medium tabular-nums tracking-tight md:text-7xl">{mm}:{ss}</span>
      </div>
      <div className="flex gap-2.5">
        <button onClick={toggle} className="flex items-center gap-2 rounded-full bg-focus px-6 py-3 text-sm font-medium text-white shadow-soft transition-all duration-200 ease-smooth hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-95">
          {running ? <Pause size={15} /> : <Play size={15} />}
          {running ? "Pausar" : "Iniciar"}
        </button>
        <button onClick={reset} className="flex items-center gap-2 rounded-full border border-[rgb(var(--border))] px-5 py-3 text-sm text-muted transition-all duration-200 ease-smooth hover:border-focus/30 hover:text-[rgb(var(--text-primary))]">
          <RotateCcw size={15} /> Reiniciar
        </button>
      </div>
      <button onClick={() => setFocusMode((f) => !f)} className="text-xs text-muted hover:text-focus transition-colors">
        {focusMode ? "Sair do Modo Focus" : "Entrar no Modo Focus"}
      </button>
    </div>
  );

  if (focusMode) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgb(var(--bg))] animate-fade-in">
        {content}
      </div>
    );
  }

  return <div className="h-[70vh]">{content}</div>;
}
