const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    ...(!(rest.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = typeof window !== "undefined" ? localStorage.getItem("lifeos-access-token") : null;
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Erro ${res.status} ao contactar a API.`);
  }

  return res.json();
}

const j = (body: unknown) => JSON.stringify(body);

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiFetch("/auth/register", { method: "POST", body: j(data), auth: false }),
  login: (data: { email: string; password: string }) =>
    apiFetch<{ access_token: string; refresh_token: string }>("/auth/login", {
      method: "POST", body: j(data), auth: false,
    }),
  me: () => apiFetch("/users/me"),
};

export const dashboardApi = { get: () => apiFetch("/dashboard") };

export const overviewApi = {
  today: () => apiFetch("/today"),
  favorites: () => apiFetch("/favorites"),
  archived: () => apiFetch("/archived"),
  badges: () => apiFetch("/badges"),
};

export const tasksApi = {
  list: (params?: string) => apiFetch(`/tasks${params ? `?${params}` : ""}`),
  create: (data: any) => apiFetch("/tasks", { method: "POST", body: j(data) }),
  update: (id: string, data: any) => apiFetch(`/tasks/${id}`, { method: "PATCH", body: j(data) }),
  remove: (id: string) => apiFetch(`/tasks/${id}`, { method: "DELETE" }),
};

export const projectsApi = {
  list: () => apiFetch("/projects"),
  create: (data: any) => apiFetch("/projects", { method: "POST", body: j(data) }),
  update: (id: string, data: any) => apiFetch(`/projects/${id}`, { method: "PATCH", body: j(data) }),
  remove: (id: string) => apiFetch(`/projects/${id}`, { method: "DELETE" }),
};

export const calendarApi = {
  merged: () => apiFetch("/calendar/merged"),
  events: () => apiFetch("/calendar/events"),
  create: (data: any) => apiFetch("/calendar/events", { method: "POST", body: j(data) }),
  remove: (id: string) => apiFetch(`/calendar/events/${id}`, { method: "DELETE" }),
};

export const pomodoroApi = {
  start: (data: any) => apiFetch("/pomodoro/start", { method: "POST", body: j(data) }),
  stop: (id: string) => apiFetch(`/pomodoro/${id}/stop`, { method: "POST" }),
  history: () => apiFetch("/pomodoro/history"),
};

export const goalsApi = {
  list: () => apiFetch("/goals"),
  create: (data: any) => apiFetch("/goals", { method: "POST", body: j(data) }),
  update: (id: string, data: any) => apiFetch(`/goals/${id}`, { method: "PATCH", body: j(data) }),
  remove: (id: string) => apiFetch(`/goals/${id}`, { method: "DELETE" }),
};

export const habitsApi = {
  list: () => apiFetch("/habits"),
  create: (data: any) => apiFetch("/habits", { method: "POST", body: j(data) }),
  checkIn: (id: string) => apiFetch(`/habits/${id}/check-in`, { method: "POST" }),
  remove: (id: string) => apiFetch(`/habits/${id}`, { method: "DELETE" }),
};

export const journalApi = {
  list: () => apiFetch("/journal"),
  upsert: (data: any) => apiFetch("/journal", { method: "POST", body: j(data) }),
};

export const notesApi = {
  list: () => apiFetch("/notes"),
  create: (data: any) => apiFetch("/notes", { method: "POST", body: j(data) }),
  update: (id: string, data: any) => apiFetch(`/notes/${id}`, { method: "PATCH", body: j(data) }),
  remove: (id: string) => apiFetch(`/notes/${id}`, { method: "DELETE" }),
};

export const libraryApi = {
  list: () => apiFetch("/library"),
  upload: (file: File, action: string) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch(`/library/upload?action=${action}`, { method: "POST", body: form });
  },
  remove: (id: string) => apiFetch(`/library/${id}`, { method: "DELETE" }),
};

export const searchApi = { query: (q: string) => apiFetch(`/search?q=${encodeURIComponent(q)}`) };

export const aiApi = {
  ask: (question: string, context = "") =>
    apiFetch<{ answer: string }>("/ai/ask", { method: "POST", body: j({ question, context }) }),
  plan: (goal_description: string) =>
    apiFetch<{ plan: string }>("/ai/plan", { method: "POST", body: j({ goal_description }) }),
};

export const statsApi = {
  overview: () => apiFetch("/stats/overview"),
  monthly: () => apiFetch("/stats/monthly"),
};

export const notificationsApi = {
  list: () => apiFetch("/notifications"),
  markRead: (id: string) => apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
};

export const trashApi = {
  list: () => apiFetch("/trash"),
  restore: (type: string, id: string) => apiFetch(`/trash/${type}/${id}/restore`, { method: "POST" }),
  purge: (type: string, id: string) => apiFetch(`/trash/${type}/${id}`, { method: "DELETE" }),
};
