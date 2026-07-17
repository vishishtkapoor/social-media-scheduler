import type {
  ActivityStatus,
  EffectiveActivityStatus,
  Priority,
  WorkflowStatus,
} from "../types";

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const EFFECTIVE_STATUS_LABELS: Record<EffectiveActivityStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

export const STATUS_CHART_COLORS: Record<EffectiveActivityStatus, string> = {
  scheduled: "#0ea5e9",
  in_progress: "#6366f1",
  completed: "#10b981",
  overdue: "#f43f5e",
  cancelled: "#94a3b8",
};

export const PRIORITY_CHART_COLORS: Record<Priority, string> = {
  low: "#94a3b8",
  medium: "#f59e0b",
  high: "#f43f5e",
};

export const WORKFLOW_STATUS_CHART_COLORS: Record<WorkflowStatus, string> = {
  active: "#10b981",
  paused: "#f59e0b",
  completed: "#6366f1",
  archived: "#94a3b8",
};
