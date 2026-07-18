"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { notificationsApi } from "@/lib/api/client";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  function load() {
    notificationsApi.list().then(setNotifications).catch(() => {});
  }
  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000); // atualiza a cada minuto
    return () => clearInterval(interval);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  async function markRead(id: string) {
    await notificationsApi.markRead(id);
    load();
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative rounded-lg border border-[rgb(var(--border))] p-1.5 hover:bg-[rgb(var(--border))]/30">
        <Bell size={14} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-signal text-[9px] text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-40 w-72 rounded-xl border border-[rgb(var(--border))] bg-surface shadow-xl">
          <div className="max-h-80 overflow-y-auto py-1">
            {notifications.length === 0 && <p className="px-4 py-3 text-sm text-muted">Sem notificações.</p>}
            {notifications.map((n) => (
              <button
                key={n.id} onClick={() => markRead(n.id)}
                className={`flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-xs ${n.read ? "opacity-50" : ""} hover:bg-[rgb(var(--border))]/20`}
              >
                <span className="text-[10px] uppercase text-muted">{n.type}</span>
                <span>{n.content}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
