import type { WorkflowStatus } from "../types";
import { WORKFLOW_STATUS_LABELS } from "../lib/labels";
import { cn } from "../lib/cn";

const STYLES: Record<WorkflowStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  paused: "bg-amber-50 text-amber-700 ring-amber-600/20",
  completed: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  archived: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
}

export function WorkflowStatusBadge({ status, className }: WorkflowStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      {WORKFLOW_STATUS_LABELS[status]}
    </span>
  );
}
