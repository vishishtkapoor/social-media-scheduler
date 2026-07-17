import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FolderOpen, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import type { Activity, ActivityDraft, ActivityStatus, WorkflowDraft } from "../types";
import {
  useWorkflow,
  useActivitiesForWorkflow,
  updateWorkflow,
  deleteWorkflow,
  createActivity,
  updateActivity,
  deleteActivity,
  setActivityStatus,
} from "../lib/store";
import { toast } from "../lib/toast";
import { workflowProgress, getOverdueActivities } from "../lib/analytics";
import { getEffectiveStatus } from "../lib/status";
import { dayLabel, formatDate, timeAgo, toDateInputValue } from "../lib/date";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { WorkflowStatusBadge } from "../components/WorkflowStatusBadge";
import { WorkflowModal } from "../components/WorkflowModal";
import { ActivityModal } from "../components/ActivityModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { ActivityItem } from "../components/ActivityItem";

export function WorkflowDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workflow = useWorkflow(id);
  const activities = useActivitiesForWorkflow(id);

  const [editWorkflowOpen, setEditWorkflowOpen] = useState(false);
  const [deleteWorkflowOpen, setDeleteWorkflowOpen] = useState(false);
  const [activityModal, setActivityModal] = useState<{ open: boolean; editing: Activity | null }>({
    open: false,
    editing: null,
  });
  const [deleteActivityTarget, setDeleteActivityTarget] = useState<Activity | null>(null);

  const progress = useMemo(
    () => (workflow ? workflowProgress(workflow, activities) : null),
    [workflow, activities],
  );

  const { overdue, upcoming, completed, cancelled } = useMemo(() => {
    const now = new Date();
    return {
      overdue: getOverdueActivities(activities, now),
      upcoming: activities
        .filter((a) => {
          const s = getEffectiveStatus(a, now);
          return s === "scheduled" || s === "in_progress";
        })
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
      completed: activities
        .filter((a) => a.status === "completed")
        .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")),
      cancelled: activities
        .filter((a) => a.status === "cancelled")
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    };
  }, [activities]);

  const upcomingGroups = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of upcoming) {
      const key = toDateInputValue(a.scheduledAt);
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [upcoming]);

  if (!workflow || !progress) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Workflow not found"
        description="It may have been deleted, or the link is incorrect."
        action={
          <Link to="/workflows">
            <Button variant="secondary">
              <ArrowLeft className="size-4" />
              Back to workflows
            </Button>
          </Link>
        }
      />
    );
  }

  const handleWorkflowSubmit = (draft: WorkflowDraft) => {
    updateWorkflow(workflow.id, draft);
    toast("Workflow updated");
    setEditWorkflowOpen(false);
  };

  const handleDeleteWorkflow = () => {
    deleteWorkflow(workflow.id);
    toast("Workflow deleted");
    navigate("/workflows");
  };

  function handleActivitySubmit(draft: ActivityDraft) {
    if (activityModal.editing) {
      updateActivity(activityModal.editing.id, draft);
      toast("Activity updated");
    } else {
      createActivity(draft);
      toast("Activity added");
    }
    setActivityModal({ open: false, editing: null });
  }

  function handleStatusChange(activity: Activity, status: ActivityStatus) {
    setActivityStatus(activity.id, status);
    toast(status === "completed" ? "Activity completed" : "Activity status updated");
  }

  function handleDeleteActivity() {
    if (!deleteActivityTarget) return;
    deleteActivity(deleteActivityTarget.id);
    toast("Activity deleted");
    setDeleteActivityTarget(null);
  }

  return (
    <div className="space-y-6">
      <Link
        to="/workflows"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
      >
        <ArrowLeft className="size-4" />
        All workflows
      </Link>

      {/* Workflow header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                {workflow.name}
              </h1>
              <WorkflowStatusBadge status={workflow.status} />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
              {workflow.description || "No description"}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Created {formatDate(workflow.createdAt)} · Updated {timeAgo(workflow.updatedAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" onClick={() => setEditWorkflowOpen(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button variant="danger" onClick={() => setDeleteWorkflowOpen(true)}>
              <Trash2 className="size-4" />
              Delete
            </Button>
            <Button onClick={() => setActivityModal({ open: true, editing: null })}>
              <Plus className="size-4" />
              Add Activity
            </Button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <ProgressBar value={progress.percent} showLabel className="max-w-md flex-1" />
          <p className="text-sm text-slate-600">
            <span className="font-semibold tabular-nums text-slate-900">
              {progress.completed}
            </span>{" "}
            of {progress.total} activities completed
          </p>
        </div>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <Card
          title={`Overdue (${overdue.length})`}
          subtitle="Past their scheduled time and still open"
          bodyClassName="p-3"
        >
          <ul className="space-y-2">
            {overdue.map((activity) => (
              <li key={activity.id}>
                <ActivityItem
                  activity={activity}
                  onComplete={() => handleStatusChange(activity, "completed")}
                  onStatusChange={(s) => handleStatusChange(activity, s)}
                  onEdit={() => setActivityModal({ open: true, editing: activity })}
                  onDelete={() => setDeleteActivityTarget(activity)}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Upcoming timeline */}
      <Card
        title="Upcoming & in progress"
        subtitle="The active queue for this workflow"
        bodyClassName="p-0"
      >
        {upcomingGroups.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={ListChecks}
              title="No scheduled activities yet"
              description="Add an activity to start tracking work in this workflow."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcomingGroups.map(([date, items]) => (
              <div key={date} className="px-4 py-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {dayLabel(items[0].scheduledAt)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDate(items[0].scheduledAt)} · {items.length} activity
                    {items.length > 1 ? "ies" : ""}
                  </span>
                </div>
                <ul className="space-y-2">
                  {items.map((activity) => (
                    <li key={activity.id}>
                      <ActivityItem
                        activity={activity}
                        onComplete={() => handleStatusChange(activity, "completed")}
                        onStatusChange={(s) => handleStatusChange(activity, s)}
                        onEdit={() => setActivityModal({ open: true, editing: activity })}
                        onDelete={() => setDeleteActivityTarget(activity)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Completed */}
      {completed.length > 0 && (
        <Card
          title={`Completed (${completed.length})`}
          subtitle="Done and recorded"
          bodyClassName="p-3"
        >
          <ul className="space-y-2">
            {completed.map((activity) => (
              <li key={activity.id}>
                <ActivityItem
                  activity={activity}
                  onComplete={() => handleStatusChange(activity, "completed")}
                  onStatusChange={(s) => handleStatusChange(activity, s)}
                  onEdit={() => setActivityModal({ open: true, editing: activity })}
                  onDelete={() => setDeleteActivityTarget(activity)}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Cancelled */}
      {cancelled.length > 0 && (
        <Card
          title={`Cancelled (${cancelled.length})`}
          subtitle="No longer happening"
          bodyClassName="p-3"
        >
          <ul className="space-y-2">
            {cancelled.map((activity) => (
              <li key={activity.id}>
                <ActivityItem
                  activity={activity}
                  onStatusChange={(s) => handleStatusChange(activity, s)}
                  onEdit={() => setActivityModal({ open: true, editing: activity })}
                  onDelete={() => setDeleteActivityTarget(activity)}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <WorkflowModal
        open={editWorkflowOpen}
        initial={workflow}
        onClose={() => setEditWorkflowOpen(false)}
        onSubmit={handleWorkflowSubmit}
      />

      <ActivityModal
        open={activityModal.open}
        workflows={[workflow]}
        initial={activityModal.editing}
        onClose={() => setActivityModal({ open: false, editing: null })}
        onSubmit={handleActivitySubmit}
      />

      <ConfirmDialog
        open={deleteWorkflowOpen}
        title="Delete workflow"
        message={`Deleting "${workflow.name}" will also remove all ${activities.length} activities in it. This cannot be undone.`}
        confirmLabel="Delete workflow"
        onConfirm={handleDeleteWorkflow}
        onCancel={() => setDeleteWorkflowOpen(false)}
      />

      <ConfirmDialog
        open={deleteActivityTarget !== null}
        title="Delete activity"
        message={`Delete "${deleteActivityTarget?.title ?? ""}"? This cannot be undone.`}
        confirmLabel="Delete activity"
        onConfirm={handleDeleteActivity}
        onCancel={() => setDeleteActivityTarget(null)}
      />
    </div>
  );
}
