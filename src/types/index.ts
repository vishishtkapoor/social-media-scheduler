/** Centralized domain types for LoopDesk. */

export type WorkflowStatus = "active" | "paused" | "completed" | "archived";

export type ActivityStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export type Priority = "low" | "medium" | "high";

/**
 * "overdue" is never persisted — it is derived from `scheduledAt` and the
 * current time whenever an activity is displayed or counted.
 */
export type EffectiveActivityStatus = ActivityStatus | "overdue";

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  workflowId: string;
  title: string;
  description: string;
  scheduledAt: string;
  status: ActivityStatus;
  priority: Priority;
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
}

/** Payload for creating/updating a workflow (timestamps are owned by the store). */
export interface WorkflowDraft {
  name: string;
  description: string;
  status: WorkflowStatus;
}

/** Payload for creating/updating an activity (timestamps are owned by the store). */
export interface ActivityDraft {
  workflowId: string;
  title: string;
  description: string;
  scheduledAt: string;
  status: ActivityStatus;
  priority: Priority;
}
