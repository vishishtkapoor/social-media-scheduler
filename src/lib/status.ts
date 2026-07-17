import type { Activity, EffectiveActivityStatus } from "../types";

/**
 * An activity is "overdue" when its scheduled time has passed and it is not
 * completed or cancelled. Overdue is derived on demand — it is never stored.
 */
export function getEffectiveStatus(activity: Activity, now: Date = new Date()): EffectiveActivityStatus {
  if (activity.status === "completed" || activity.status === "cancelled") {
    return activity.status;
  }
  if (new Date(activity.scheduledAt).getTime() < now.getTime()) {
    return "overdue";
  }
  return activity.status;
}

export function isOverdue(activity: Activity, now?: Date): boolean {
  return getEffectiveStatus(activity, now) === "overdue";
}

/** Not finished and not cancelled — still on the active queue. */
export function isActionable(activity: Activity, now?: Date): boolean {
  const status = getEffectiveStatus(activity, now);
  return status !== "completed" && status !== "cancelled";
}
