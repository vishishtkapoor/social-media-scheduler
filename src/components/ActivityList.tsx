import type { Activity } from "../types";
import { ActivityItem } from "./ActivityItem";
import type { ActivityItemProps } from "./ActivityItem";
import { EmptyState } from "./EmptyState";
import { CalendarX } from "lucide-react";

interface ActivityListProps extends Omit<ActivityItemProps, "activity"> {
  activities: Activity[];
  emptyMessage?: string;
  workflowNames?: Record<string, string>;
}

export function ActivityList({
  activities,
  emptyMessage,
  workflowNames,
  ...itemProps
}: ActivityListProps) {
  if (activities.length === 0) {
    return emptyMessage ? (
      <EmptyState icon={CalendarX} title={emptyMessage} />
    ) : null;
  }
  return (
    <ul className="space-y-2">
      {activities.map((activity) => (
        <li key={activity.id}>
          <ActivityItem
            activity={activity}
            workflowName={workflowNames?.[activity.workflowId]}
            showWorkflow={Boolean(workflowNames)}
            {...itemProps}
          />
        </li>
      ))}
    </ul>
  );
}
