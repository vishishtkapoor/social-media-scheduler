import type { Activity, Workflow } from "../types";
import { buildSeedData } from "../data/seedData";

/**
 * Persistence layer. Everything reads/writes LocalStorage through this module
 * so a real API can replace it later without touching components.
 */

const WORKFLOWS_KEY = "loopdesk.workflows.v1";
const ACTIVITIES_KEY = "loopdesk.activities.v1";
const SEEDED_KEY = "loopdesk.seeded.v1";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Seed realistic demo data the first time the app launches. */
function ensureSeeded(): void {
  try {
    if (localStorage.getItem(SEEDED_KEY)) return;
    const { workflows, activities } = buildSeedData();
    writeJson(WORKFLOWS_KEY, workflows);
    writeJson(ACTIVITIES_KEY, activities);
    localStorage.setItem(SEEDED_KEY, "true");
  } catch {
    // If seeding fails (e.g. storage unavailable) the app falls back to empty data.
  }
}

export function getWorkflows(): Workflow[] {
  ensureSeeded();
  return readJson<Workflow[]>(WORKFLOWS_KEY) ?? [];
}

export function saveWorkflows(workflows: Workflow[]): void {
  writeJson(WORKFLOWS_KEY, workflows);
}

export function getActivities(): Activity[] {
  ensureSeeded();
  return readJson<Activity[]>(ACTIVITIES_KEY) ?? [];
}

export function saveActivities(activities: Activity[]): void {
  writeJson(ACTIVITIES_KEY, activities);
}

export function getWorkflow(id: string): Workflow | undefined {
  return getWorkflows().find((w) => w.id === id);
}

export function getActivitiesForWorkflow(workflowId: string): Activity[] {
  return getActivities().filter((a) => a.workflowId === workflowId);
}

/** Wipe stored data so the next read re-seeds the demo dataset. */
export function resetData(): void {
  localStorage.removeItem(WORKFLOWS_KEY);
  localStorage.removeItem(ACTIVITIES_KEY);
  localStorage.removeItem(SEEDED_KEY);
}
