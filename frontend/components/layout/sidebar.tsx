"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Sun, Calendar, CheckSquare, FolderKanban, Timer, Target,
  Repeat, BookOpen as Journal, FileText, Library, BarChart3,
  Settings, Star, Archive, X, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { overviewApi } from "@/lib/api/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hoje", label: "Hoje", icon: Sun },
  { href: "/agenda", label: "Agenda", icon: Calendar, badge: "agenda" },
  { href: "/tarefas", label: "Tarefas", icon: CheckSquare, badge: "tarefas" },
  { href: "/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/objetivos", label: "Objetivos", icon: Target },
  { href: "/habitos", label: "Hábitos", icon: Repeat, badge: "habitos" },
  { href: "/diario", label: "Diário", icon: Journal },
  { href: "/notas", label: "Notas", icon: FileText },
  { href: "/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
];

const SECONDARY_ITEMS = [
  { href: "/favoritos", label: "Favoritos", icon: Star },
  { href: "/arquivados", label: "Arquivados", icon: Archive },
];

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen?: boolean; onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    overviewApi.badges().then((b: any) => setBadges(b)).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const stored = localStorage.getItem("lifeos-sidebar-collapsed");
    if (stored) setCollapsed(stored === "true");
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem("lifeos-sidebar-collapsed", String(!c));
      return !c;
    });
  }

  function Item({ href, label, icon: Icon, badge }: any) {
    const active = pathname?.startsWith(href);
    const count = badge ? badges[badge] : undefined;
    return (
      <Link
        href={href}
        onClick={onCloseMobile}
        title={collapsed ? label : undefined}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 ease-smooth ${
          active ? "bg-focus/10" : "hover:bg-[rgb(var(--text-primary))]/[0.04]"
        } ${collapsed ? "justify-center px-2" : ""}`}
      >
        <span
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full transition-all duration-300 ease-smooth ${
            active ? "bg-focus opacity-100" : "opacity-0"
          }`}
        />
        <Icon
          size={17}
          strokeWidth={1.75}
          className={`shrink-0 transition-colors ${active ? "text-focus" : "text-muted group-hover:text-[rgb(var(--text-primary))]"}`}
        />
        {!collapsed && (
          <span className={`truncate transition-colors ${active ? "text-[rgb(var(--text-primary))] font-medium" : "text-muted group-hover:text-[rgb(var(--text-primary))]"}`}>
            {label}
          </span>
        )}
        {!collapsed && !!count && (
          <span className="ml-auto rounded-full bg-signal/15 px-1.5 py-0.5 text-[10px] font-medium text-signal">
            {count}
          </span>
        )}
        {collapsed && !!count && (
          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-signal" />
        )}
      </Link>
    );
  }

  const content = (
    <>
      <div className={`flex items-center py-5 ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-signal shadow-[0_0_8px_rgba(201,162,39,0.6)]" />
          {!collapsed && <span className="font-display text-lg tracking-tight">LifeOS</span>}
        </div>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="md:hidden text-muted"><X size={18} /></button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => <Item key={item.href} {...item} />)}
        <div className="my-2 h-px bg-[rgb(var(--border))]" />
        {SECONDARY_ITEMS.map((item) => <Item key={item.href} {...item} />)}
      </nav>

      <div className={`flex items-center gap-2 border-t border-[rgb(var(--border))] px-3 py-3 ${collapsed ? "flex-col" : ""}`}>
        <Link
          href="/definicoes"
          title={collapsed ? "Perfil" : undefined}
          className={`flex flex-1 items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[rgb(var(--text-primary))]/[0.04] ${collapsed ? "justify-center flex-none w-full" : ""}`}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-focus/15 text-xs font-medium text-focus">U</div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">Perfil</p>
              <p className="truncate text-[11px] text-muted">Definições</p>
            </div>
          )}
        </Link>
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex shrink-0 items-center justify-center rounded-lg p-1.5 text-muted hover:bg-[rgb(var(--text-primary))]/[0.04] hover:text-[rgb(var(--text-primary))]"
          title={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={`hidden md:flex md:flex-col glass border-r border-[rgb(var(--border))] transition-[width] duration-300 ease-smooth ${
          collapsed ? "md:w-[68px]" : "md:w-64"
        }`}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onCloseMobile} />
          <aside className="relative flex w-72 flex-col glass-strong animate-slide-up shadow-glass">{content}</aside>
        </div>
      )}
    </>
  );
}
