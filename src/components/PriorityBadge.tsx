import type { Priority } from "../types";
import { PRIORITY_LABELS } from "../lib/labels";
import { cn } from "../lib/cn";

const DOT: Record<Priority, string> = {
  low: "bg-slate-400",
  medium: "bg-amber-500",
  high: "bg-rose-500",
};

const TEXT: Record<Priority, string> = {
  low: "text-slate-500",
  medium: "text-amber-700",
  high: "text-rose-700",
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-slate-200",
        TEXT[priority],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT[priority])} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
