import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon, title, description, actionLabel, onAction,
}: { icon: LucideIcon; title: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[rgb(var(--border))] px-6 py-14 text-center animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-focus/10">
        <Icon size={20} className="text-focus" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mt-1 text-xs text-muted">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-1 rounded-full bg-focus px-4 py-2 text-xs font-medium text-white shadow-soft transition-all hover:shadow-soft-lg hover:-translate-y-0.5">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
