"use client";

/**
 * Camada de dados local (localStorage) usada quando não há backend
 * configurado — permite usar o LifeOS por inteiro no telemóvel, sem
 * servidor, sem login "a sério". Mesma forma dos dados que a API real
 * devolveria, para que trocar para o backend depois seja só apagar
 * esta camada (basta definir NEXT_PUBLIC_DEMO_MODE=false).
 */

function storageKey(name: string) {
  return `lifeos-demo:${name}`;
}

function readAll<T = any>(name: string): T[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(storageKey(name));
  return raw ? JSON.parse(raw) : [];
}

function writeAll<T = any>(name: string, items: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(name), JSON.stringify(items));
}

function uid() {
  return crypto.randomUUID();
}

export const demoStore = {
  list<T = any>(name: string): T[] {
    return readAll<T>(name);
  },
  get<T = any>(name: string, id: string): T | undefined {
    return readAll<T>(name).find((i: any) => i.id === id);
  },
  create<T = any>(name: string, data: Partial<T>): T {
    const item = { id: uid(), created_at: new Date().toISOString(), ...data } as T;
    const items = readAll<T>(name);
    items.unshift(item);
    writeAll(name, items);
    return item;
  },
  update<T = any>(name: string, id: string, patch: Partial<T>): T | undefined {
    const items = readAll<T>(name);
    const idx = items.findIndex((i: any) => i.id === id);
    if (idx === -1) return undefined;
    items[idx] = { ...items[idx], ...patch } as T;
    writeAll(name, items);
    return items[idx];
  },
  remove(name: string, id: string) {
    writeAll(name, readAll(name).filter((i: any) => i.id !== id));
  },
  softDelete(name: string, id: string) {
    return this.update(name, id, { deleted_at: new Date().toISOString() } as any);
  },
  restore(name: string, id: string) {
    return this.update(name, id, { deleted_at: null } as any);
  },
  seedIfEmpty(name: string, seed: any[]) {
    if (readAll(name).length === 0) writeAll(name, seed);
  },
};

export function seedDemoData() {
  demoStore.seedIfEmpty("tasks", [
    { id: uid(), title: "Explorar o LifeOS", priority: "media", status: "pendente", progress: 0, tags: [], checklist: [], created_at: new Date().toISOString() },
    { id: uid(), title: "Testar o Pomodoro", priority: "alta", status: "pendente", progress: 0, tags: [], checklist: [], created_at: new Date().toISOString() },
  ]);
  demoStore.seedIfEmpty("projects", [
    { id: uid(), name: "Lançamento LifeOS", progress: 40, is_favorite: false, created_at: new Date().toISOString() },
  ]);
  demoStore.seedIfEmpty("habits", [
    { id: uid(), name: "Beber água", frequency: "daily", streak: 0, history: [], created_at: new Date().toISOString() },
  ]);
  demoStore.seedIfEmpty("goals", [
    { id: uid(), title: "Aprender a usar o LifeOS", progress: 20, subtasks: [], created_at: new Date().toISOString() },
  ]);
}
