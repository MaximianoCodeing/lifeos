"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens = await authApi.login({ email, password });
      localStorage.setItem("lifeos-access-token", tokens.access_token);
      localStorage.setItem("lifeos-refresh-token", tokens.refresh_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar sessão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[rgb(var(--bg))] px-4">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-focus/[0.08] blur-3xl" />
      <div className="relative w-full max-w-sm animate-slide-up rounded-3xl border border-[rgb(var(--border))] glass p-8 shadow-soft-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-2 w-2 rounded-full bg-signal shadow-[0_0_10px_rgba(201,162,39,0.6)]" />
          <h1 className="font-display text-2xl tracking-tight">Entrar no LifeOS</h1>
          <p className="mt-1.5 text-sm text-muted">A tua organização, num só lugar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-focus"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-focus"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-focus py-3 text-sm font-medium text-white shadow-soft transition-all duration-200 ease-smooth hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Ainda não tens conta?{" "}
          <Link href="/register" className="text-focus hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
