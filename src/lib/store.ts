import { useSyncExternalStore } from "react";
import type {
  Activity,
  ActivityDraft,
  ActivityStatus,
  Workflow,
  WorkflowDraft,
} from "../types";
import * as storage from "./storage";

/**
 * Tiny reactive store: components subscribe via hooks, mutations write
 * through to LocalStorage and notify subscribers. Swap this for an API
 * client later without changing component code.
 */

let cache: { workflows: Workflow[]; activities: Activity[] } | null = null;
const listeners = new Set<() => void>();

function load(): { workflows: Workflow[]; activities: Activity[] } {
  if (!cache) {
    cache = {
      workflows: storage.getWorkflows(),
      activities: storage.getActivities(),
    };
  }
  return cache;
}

function emit(): void {
  cache = null;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useWorkflows(): Workflow[] {
  return useSyncExternalStore(subscribe, () => load().workflows);
}

export function useActivities(): Activity[] {
  return useSyncExternalStore(subscribe, () => load().activities);
}

export function useWorkflow(id: string | undefined): Workflow | undefined {
  const workflows = useWorkflows();
  return workflows.find((w) => w.id === id);
}

export function useActivitiesForWorkflow(workflowId: string | undefined): Activity[] {
  const activities = useActivities();
  return workflowId ? activities.filter((a) => a.workflowId === workflowId) : [];
}

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return crypto.randomUUID();
}

function touchWorkflow(workflowId: string): void {
  const workflows = storage.getWorkflows().map((w) =>
    w.id === workflowId ? { ...w, updatedAt: nowIso() } : w,
  );
  storage.saveWorkflows(workflows);
}

export function createWorkflow(draft: WorkflowDraft): Workflow {
  const now = nowIso();
  const workflow: Workflow = { id: newId(), ...draft, createdAt: now, updatedAt: now };
  storage.saveWorkflows([...storage.getWorkflows(), workflow]);
  emit();
  return workflow;
}

export function updateWorkflow(id: string, draft: WorkflowDraft): void {
  const workflows = storage
    .getWorkflows()
    .map((w) => (w.id === id ? { ...w, ...draft, updatedAt: nowIso() } : w));
  storage.saveWorkflows(workflows);
  emit();
}

export function deleteWorkflow(id: string): void {
  storage.saveWorkflows(storage.getWorkflows().filter((w) => w.id !== id));
  storage.saveActivities(storage.getActivities().filter((a) => a.workflowId !== id));
  emit();
}

export function createActivity(draft: ActivityDraft): Activity {
  const now = nowIso();
  const activity: Activity = {
    id: newId(),
    ...draft,
    completedAt: draft.status === "completed" ? now : null,
    createdAt: now,
    updatedAt: now,
  };
  storage.saveActivities([...storage.getActivities(), activity]);
  touchWorkflow(draft.workflowId);
  emit();
  return activity;
}

export function updateActivity(id: string, draft: ActivityDraft): void {
  const now = nowIso();
  let previous: Activity | undefined;
  const activities = storage.getActivities().map((activity) => {
    if (activity.id !== id) return activity;
    previous = activity;
    const next: Activity = { ...activity, ...draft, updatedAt: now };
    if (draft.status === "completed") {
      next.completedAt = now;
    } else if (draft.status !== activity.status) {
      // Reopening a completed activity clears its completion timestamp.
      next.completedAt = null;
    }
    return next;
  });
  storage.saveActivities(activities);
  if (previous && previous.workflowId !== draft.workflowId) {
    touchWorkflow(previous.workflowId);
  }
  touchWorkflow(draft.workflowId);
  emit();
}

export function deleteActivity(id: string): void {
  const activity = storage.getActivities().find((a) => a.id === id);
  storage.saveActivities(storage.getActivities().filter((a) => a.id !== id));
  if (activity) touchWorkflow(activity.workflowId);
  emit();
}

/** Quick status change (mark complete / reopen) without a full edit. */
export function setActivityStatus(id: string, status: ActivityStatus): void {
  const activity = storage.getActivities().find((a) => a.id === id);
  if (!activity) return;
  updateActivity(id, {
    workflowId: activity.workflowId,
    title: activity.title,
    description: activity.description,
    scheduledAt: activity.scheduledAt,
    priority: activity.priority,
    status,
  });
}

export function resetDemoData(): void {
  storage.resetData();
  emit();
}
