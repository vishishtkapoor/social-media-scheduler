import type { EffectiveActivityStatus } from "../types";
import { EFFECTIVE_STATUS_LABELS } from "../lib/labels";
import { cn } from "../lib/cn";

const STYLES: Record<EffectiveActivityStatus, string> = {
  scheduled: "bg-sky-50 text-sky-700 ring-sky-600/20",
  in_progress: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  overdue: "bg-rose-50 text-rose-700 ring-rose-600/20",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

interface StatusBadgeProps {
  status: EffectiveActivityStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      {status === "overdue" && (
        <span className="size-1.5 animate-pulse rounded-full bg-rose-500" />
      )}
      {EFFECTIVE_STATUS_LABELS[status]}
    </span>
  );
}
