import { Link } from "react-router-dom";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import type { Activity, Workflow } from "../types";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";
import { ProgressBar } from "./ProgressBar";
import { IconButton } from "./IconButton";
import { nextScheduledActivity, workflowProgress } from "../lib/analytics";
import { dayLabel, formatTime, timeAgo } from "../lib/date";

interface WorkflowTableProps {
  workflows: Workflow[];
  activities: Activity[];
  onEdit: (workflow: Workflow) => void;
  onDelete: (workflow: Workflow) => void;
}

export function WorkflowTable({ workflows, activities, onEdit, onDelete }: WorkflowTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-medium">Workflow</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Activities</th>
            <th className="px-4 py-3 font-medium">Progress</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Next scheduled</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Updated</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {workflows.map((workflow) => {
            const progress = workflowProgress(workflow, activities);
            const next = nextScheduledActivity(activities, workflow.id);
            return (
              <tr key={workflow.id} className="group transition-colors hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <Link
                    to={`/workflows/${workflow.id}`}
                    className="block max-w-56 truncate font-medium text-slate-900 hover:text-indigo-600"
                  >
                    {workflow.name}
                  </Link>
                  <p className="hidden max-w-56 truncate text-xs text-slate-500 md:block">
                    {workflow.description || "No description"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <WorkflowStatusBadge status={workflow.status} />
                </td>
                <td className="hidden px-4 py-3 tabular-nums text-slate-600 sm:table-cell">
                  {progress.completed}
                  <span className="text-slate-400"> / {progress.total}</span>
                </td>
                <td className="w-40 px-4 py-3">
                  <ProgressBar value={progress.percent} size="sm" showLabel />
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  {next ? (
                    <span className="text-xs text-slate-600">
                      <span className="font-medium text-slate-800">{dayLabel(next.scheduledAt)}</span>
                      {" · "}
                      {formatTime(next.scheduledAt)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
                  {timeAgo(workflow.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-0.5">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
