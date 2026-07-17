"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme, ACCENT_COLORS } from "@/components/layout/theme-provider";
import { authApi } from "@/lib/api/client";

export default function DefinicoesPage() {
  const { theme, setTheme, accent, setAccent } = useTheme();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => { authApi.me().then(setUser).catch(() => {}); }, []);

  function logout() {
    localStorage.removeItem("lifeos-access-token");
    localStorage.removeItem("lifeos-refresh-token");
    router.push("/login");
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-semibold">Definições</h1>

      {user && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted">{user.email}</p>
        </div>
      )}

      <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
        <p className="mb-3 text-sm font-medium">Aparência</p>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button key={t} onClick={() => setTheme(t)}
              className={`rounded-lg px-3 py-1.5 text-xs ${theme === t ? "bg-focus/15 text-focus" : "border border-[rgb(var(--border))] text-muted"}`}>
              {t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Sistema"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[rgb(var(--border))] bg-surface p-4">
        <p className="mb-3 text-sm font-medium">Cor principal</p>
        <div className="flex gap-3">
          {Object.entries(ACCENT_COLORS).map(([name, rgb]) => (
            <button
              key={name} onClick={() => setAccent(name)} title={name}
              className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: `rgb(${rgb})`, borderColor: accent === name ? `rgb(${rgb})` : "transparent" }}
            />
          ))}
        </div>
      </div>

      <button onClick={logout} className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10">
        Terminar sessão
      </button>
    </div>
  );
}
