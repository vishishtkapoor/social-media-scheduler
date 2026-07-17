import { Link } from "react-router-dom";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import type { Activity, Workflow } from "../types";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";
import { ProgressBar } from "./ProgressBar";
import { IconButton } from "./IconButton";
import { nextScheduledActivity, workflowProgress } from "../lib/analytics";
import { dayLabel, formatTime, timeAgo } from "../lib/date";

interface WorkflowCardProps {
  workflow: Workflow;
  activities: Activity[];
  onEdit: (workflow: Workflow) => void;
  onDelete: (workflow: Workflow) => void;
}

export function WorkflowCard({ workflow, activities, onEdit, onDelete }: WorkflowCardProps) {
  const progress = workflowProgress(workflow, activities);
  const next = nextScheduledActivity(activities, workflow.id);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/workflows/${workflow.id}`}
          className="min-w-0 font-semibold text-slate-900 hover:text-indigo-600"
        >
          <span className="block truncate">{workflow.name}</span>
        </Link>
        <WorkflowStatusBadge status={workflow.status} />
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
        {workflow.description || "No description"}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <ProgressBar value={progress.percent} size="sm" className="flex-1" />
        <span className="text-xs font-semibold tabular-nums text-slate-700">{progress.percent}%</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {progress.completed} of {progress.total} activities completed
        {next && (
          <>
            {" · Next: "}
            <span className="font-medium text-slate-700">
              {dayLabel(next.scheduledAt)} {formatTime(next.scheduledAt)}
            </span>
          </>
        )}
      </p>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">Updated {timeAgo(workflow.updatedAt)}</span>
        <div className="flex items-center gap-0.5">
          <Link
            to={`/workflows/${workflow.id}`}
            aria-label={`Open ${workflow.name}`}
            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronRight className="size-4" />
          </Link>
          <IconButton label={`Edit ${workflow.name}`} onClick={() => onEdit(workflow)}>
            <Pencil className="size-4" />
          </IconButton>
          <IconButton label={`Delete ${workflow.name}`} onClick={() => onDelete(workflow)}>
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
