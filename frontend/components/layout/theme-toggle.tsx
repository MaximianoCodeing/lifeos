"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";

const OPTIONS = [
  { value: "light" as const, icon: Sun, label: "Claro" },
  { value: "dark" as const, icon: Moon, label: "Escuro" },
  { value: "system" as const, icon: Monitor, label: "Sistema" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-xl bg-surface p-1 border border-[rgb(var(--border))]">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={`Tema ${label}`}
          aria-pressed={theme === value}
          className={`rounded-lg p-1.5 transition-colors duration-200 ${
            theme === value
              ? "bg-focus/15 text-focus"
              : "text-muted hover:text-[rgb(var(--text-primary))]"
          }`}
        >
          <Icon size={15} strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}
