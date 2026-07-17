import type {
  Activity,
  EffectiveActivityStatus,
  Priority,
  Workflow,
  WorkflowStatus,
} from "../types";
import { isActionable, getEffectiveStatus } from "./status";
import { toDateInputValue } from "./date";

/** All analytics are computed from the stored activities/workflows on demand. */

export interface StatusCount {
  status: EffectiveActivityStatus;
  count: number;
}

export interface PriorityCount {
  priority: Priority;
  count: number;
}

export interface WorkflowStatusCount {
  status: WorkflowStatus;
  count: number;
}

export interface DailyCount {
  date: string;
  label: string;
  count: number;
}

export interface WorkflowProgress {
  workflow: Workflow;
  total: number;
  completed: number;
  percent: number;
}

export function round(value: number): number {
  return Math.round(value * 10) / 10;
}

const STATUS_ORDER: EffectiveActivityStatus[] = [
  "scheduled",
  "in_progress",
  "completed",
  "overdue",
  "cancelled",
];

export function countByStatus(activities: Activity[], now: Date = new Date()): StatusCount[] {
  const counts = new Map<EffectiveActivityStatus, number>();
  for (const activity of activities) {
    const status = getEffectiveStatus(activity, now);
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  return STATUS_ORDER.map((status) => ({ status, count: counts.get(status) ?? 0 }));
}

export function completionRate(activities: Activity[]): number {
  if (activities.length === 0) return 0;
  const completed = activities.filter((a) => a.status === "completed").length;
  return round((completed / activities.length) * 100);
}

export function overdueRate(activities: Activity[], now: Date = new Date()): number {
  if (activities.length === 0) return 0;
  const overdue = activities.filter((a) => getEffectiveStatus(a, now) === "overdue").length;
  return round((overdue / activities.length) * 100);
}

/** Mean time from creation to completion, in milliseconds. Null when nothing is completed. */
export function avgCompletionTime(activities: Activity[]): number | null {
  const completed = activities.filter((a) => a.status === "completed" && a.completedAt);
  if (completed.length === 0) return null;
  const total = completed.reduce(
    (sum, a) => sum + (new Date(a.completedAt as string).getTime() - new Date(a.createdAt).getTime()),
    0,
  );
  return total / completed.length;
}

/** Daily completed-activity counts for the trailing `days` days ending today. */
export function completedOverTime(
  activities: Activity[],
  days = 14,
  now: Date = new Date(),
): DailyCount[] {
  const buckets: DailyCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    buckets.push({
      date: toDateInputValue(d),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: 0,
    });
  }
  const index = new Map(buckets.map((b, i) => [b.date, i]));
  for (const activity of activities) {
    if (activity.status !== "completed" || !activity.completedAt) continue;
    const i = index.get(toDateInputValue(activity.completedAt));
    if (i !== undefined) buckets[i].count += 1;
  }
  return buckets;
}

export function priorityDistribution(activities: Activity[]): PriorityCount[] {
  const order: Priority[] = ["high", "medium", "low"];
  const counts = new Map<Priority, number>();
  for (const activity of activities) {
    counts.set(activity.priority, (counts.get(activity.priority) ?? 0) + 1);
  }
  return order.map((priority) => ({ priority, count: counts.get(priority) ?? 0 }));
}

export function workflowStatusDistribution(workflows: Workflow[]): WorkflowStatusCount[] {
  const order: WorkflowStatus[] = ["active", "paused", "completed", "archived"];
  const counts = new Map<WorkflowStatus, number>();
  for (const workflow of workflows) {
    counts.set(workflow.status, (counts.get(workflow.status) ?? 0) + 1);
  }
  return order.map((status) => ({ status, count: counts.get(status) ?? 0 }));
}

/** Progress = completed / total activities. Zero activities → 0%. */
export function workflowProgress(workflow: Workflow, activities: Activity[]): WorkflowProgress {
  const list = activities.filter((a) => a.workflowId === workflow.id);
  const completed = list.filter((a) => a.status === "completed").length;
  return {
    workflow,
    total: list.length,
    completed,
    percent: list.length === 0 ? 0 : round((completed / list.length) * 100),
  };
}

export function getUpcomingActivities(
  activities: Activity[],
  now: Date = new Date(),
  limit?: number,
): Activity[] {
  const list = activities
    .filter((a) => isActionable(a, now) && new Date(a.scheduledAt).getTime() >= now.getTime())
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  return limit === undefined ? list : list.slice(0, limit);
}

export function getOverdueActivities(activities: Activity[], now: Date = new Date()): Activity[] {
  return activities
    .filter((a) => getEffectiveStatus(a, now) === "overdue")
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export function getRecentActivities(activities: Activity[], limit = 6): Activity[] {
  return [...activities]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

/** Earliest future actionable activity for a workflow, or null. */
export function nextScheduledActivity(
  activities: Activity[],
  workflowId: string,
  now: Date = new Date(),
): Activity | null {
  const upcoming = getUpcomingActivities(
    activities.filter((a) => a.workflowId === workflowId),
    now,
  );
  return upcoming[0] ?? null;
}
