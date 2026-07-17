"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export const ACCENT_COLORS: Record<string, string> = {
  azul: "10 132 255",
  roxo: "175 130 255",
  verde: "48 209 88",
  laranja: "255 159 10",
  vermelho: "255 69 58",
};

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  accent: string;
  setAccent: (accent: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [accent, setAccentState] = useState<string>("azul");

  useEffect(() => {
    const stored = (localStorage.getItem("lifeos-theme") as Theme) || "system";
    setThemeState(stored);
    const storedAccent = localStorage.getItem("lifeos-accent") || "azul";
    setAccentState(storedAccent);
    document.documentElement.style.setProperty("--accent", ACCENT_COLORS[storedAccent] || ACCENT_COLORS.azul);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const resolved =
        theme === "system" ? (mediaQuery.matches ? "dark" : "light") : theme;
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };

    apply();
    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = (next: Theme) => {
    localStorage.setItem("lifeos-theme", next);
    setThemeState(next);
  };

  const setAccent = (next: string) => {
    localStorage.setItem("lifeos-accent", next);
    setAccentState(next);
    document.documentElement.style.setProperty("--accent", ACCENT_COLORS[next] || ACCENT_COLORS.azul);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return ctx;
}
