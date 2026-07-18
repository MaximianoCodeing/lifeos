"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.register({ name, email, password });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
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
          <h1 className="font-display text-2xl tracking-tight">Criar conta no LifeOS</h1>
          <p className="mt-1.5 text-sm text-muted">Começa a organizar a tua vida hoje.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-focus"
          />
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
            minLength={8}
            placeholder="Password (mín. 8 caracteres)"
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
            {loading ? "A criar conta…" : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Já tens conta?{" "}
          <Link href="/login" className="text-focus hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
