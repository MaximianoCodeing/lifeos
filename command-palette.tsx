"use client";

import { Search, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";

export function Topbar({
  onOpenCommandPalette, onOpenMobileNav,
}: { onOpenCommandPalette: () => void; onOpenMobileNav?: () => void }) {
  return (
    <header className="flex items-center justify-between glass border-b border-[rgb(var(--border))] px-4 py-3 md:px-6">
      <div className="flex items-center gap-2">
        {onOpenMobileNav && (
          <button onClick={onOpenMobileNav} className="md:hidden text-muted p-1.5 -ml-1.5 rounded-lg hover:bg-[rgb(var(--text-primary))]/[0.04]">
            <Menu size={18} />
          </button>
        )}
        <button
          onClick={onOpenCommandPalette}
          className="flex w-40 sm:w-80 items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--text-primary))]/[0.03] px-3.5 py-2 text-sm text-muted transition-all hover:border-focus/30 hover:bg-[rgb(var(--text-primary))]/[0.05]"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Pesquisar ou executar um comando…</span>
          <span className="sm:hidden">Pesquisar…</span>
          <kbd className="ml-auto hidden sm:inline rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-1.5 py-0.5 font-mono text-[11px] text-muted">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationBell />
        <ThemeToggle />
        <div className="h-8 w-8 rounded-full bg-focus/15 flex items-center justify-center text-focus text-sm font-medium ring-1 ring-focus/20">
          U
        </div>
      </div>
    </header>
  );
}
