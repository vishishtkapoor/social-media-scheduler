import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-200">
          <Icon className="size-5" />
        </span>
      )}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
