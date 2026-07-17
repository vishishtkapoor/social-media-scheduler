import { Check, Clock, Pencil, Trash2 } from "lucide-react";
import type { Activity, ActivityStatus } from "../types";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { StatusSelect } from "./StatusSelect";
import { IconButton } from "./IconButton";
import { formatDateTime, formatDate } from "../lib/date";
import { getEffectiveStatus } from "../lib/status";
import { cn } from "../lib/cn";

export interface ActivityItemProps {
  activity: Activity;
  workflowName?: string;
  showWorkflow?: boolean;
  onComplete?: () => void;
  onStatusChange?: (status: ActivityStatus) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const DOT: Record<string, string> = {
  completed: "bg-emerald-500",
  overdue: "bg-rose-500",
  in_progress: "bg-indigo-500",
  scheduled: "bg-slate-300",
  cancelled: "bg-slate-300",
};

export function ActivityItem({
  activity,
  workflowName,
  showWorkflow = false,
  onComplete,
  onStatusChange,
  onEdit,
  onDelete,
}: ActivityItemProps) {
  const effective = getEffectiveStatus(activity);
  const isCompleted = effective === "completed";
  const isCancelled = effective === "cancelled";
  const isOverdue = effective === "overdue";

  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-3 rounded-lg border bg-white p-3 transition-shadow hover:shadow-sm",
        isOverdue ? "border-rose-200" : "border-slate-200",
        isCancelled && "opacity-60",
      )}
    >
      {onComplete ? (
        <button
          type="button"
          onClick={onComplete}
          disabled={isCompleted || isCancelled}
          aria-label={isCompleted ? "Completed" : "Mark complete"}
          title={isCompleted ? "Completed" : "Mark complete"}
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            isCompleted
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 text-transparent hover:border-emerald-500 hover:text-emerald-500 disabled:cursor-not-allowed",
          )}
        >
          <Check className="size-3" strokeWidth={3} />
        </button>
      ) : (
        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", DOT[effective])} />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p
            className={cn(
              "truncate text-sm font-medium text-slate-900",
              (isCompleted || isCancelled) && "text-slate-400 line-through",
            )}
          >
            {activity.title}
          </p>
          <StatusBadge status={effective} />
          <PriorityBadge priority={activity.priority} />
        </div>
        {activity.description && (
          <p
            className={cn(
              "mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500",
              isCompleted && "text-slate-400",
            )}
          >
            {activity.description}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {formatDateTime(activity.scheduledAt)}
            {isOverdue && <span className="font-medium text-rose-600">· Overdue</span>}
          </span>
          {showWorkflow && workflowName && <span>· {workflowName}</span>}
          {activity.completedAt && (
            <span className="text-emerald-600">Completed {formatDate(activity.completedAt)}</span>
          )}
        </div>
      </div>

      {(onStatusChange || onEdit || onDelete) && (
        <div className="flex shrink-0 items-center gap-1">
          {onStatusChange && <StatusSelect value={activity.status} onChange={onStatusChange} />}
          {onEdit && (
            <IconButton label="Edit activity" onClick={onEdit}>
              <Pencil className="size-4" />
            </IconButton>
          )}
          {onDelete && (
            <IconButton label="Delete activity" onClick={onDelete}>
              <Trash2 className="size-4" />
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
}
