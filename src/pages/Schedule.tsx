import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CalendarX } from "lucide-react";
import type { Activity, ActivityStatus, Priority } from "../types";
import { useActivities, useWorkflows } from "../lib/store";
import { getEffectiveStatus } from "../lib/status";
import { dayLabel, formatDate, formatTime, toDateInputValue } from "../lib/date";

import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { SelectInput, TextInput } from "../components/form";
import { cn } from "../lib/cn";

type View = "all" | "today" | "upcoming" | "overdue" | "completed";

const VIEWS: Array<{ value: View; label: string }> = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "overdue", label: "Overdue" },
  { value: "completed", label: "Completed" },
];

const STATUS_FILTERS: Array<{ value: ActivityStatus | "overdue" | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "overdue", label: "Overdue" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function Schedule() {
  const activities = useActivities();
  const workflows = useWorkflows();

  const [view, setView] = useState<View>("all");
  const [workflowFilter, setWorkflowFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "overdue" | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [dateFilter, setDateFilter] = useState("");

  const workflowNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const w of workflows) map[w.id] = w.name;
    return map;
  }, [workflows]);

  const filtered = useMemo(() => {
    const now = new Date();
    let list = activities.filter((a) => {
      if (workflowFilter !== "all" && a.workflowId !== workflowFilter) return false;
      if (priorityFilter !== "all" && a.priority !== priorityFilter) return false;
      if (statusFilter !== "all" && getEffectiveStatus(a, now) !== statusFilter) return false;
      if (dateFilter && toDateInputValue(a.scheduledAt) !== dateFilter) return false;
      return true;
    });
    switch (view) {
      case "today":
        list = list.filter((a) => toDateInputValue(a.scheduledAt) === toDateInputValue(now));
        break;
      case "upcoming":
        list = list.filter(
          (a) =>
            getEffectiveStatus(a, now) !== "completed" &&
            getEffectiveStatus(a, now) !== "cancelled" &&
            new Date(a.scheduledAt).getTime() >= now.getTime(),
        );
        break;
      case "overdue":
        list = list.filter((a) => getEffectiveStatus(a, now) === "overdue");
        break;
      case "completed":
        list = list.filter((a) => a.status === "completed");
        break;
    }
    return list;
  }, [activities, workflowFilter, priorityFilter, statusFilter, dateFilter, view]);

  const groups = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of filtered) {
      const key = toDateInputValue(a.scheduledAt);
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    }
    return [...map.entries()]
      .map(([key, items]) => ({
        key,
        items: items.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [filtered]);

  const countFor = (v: View): number => {
    const now = new Date();
    switch (v) {
      case "today":
        return activities.filter((a) => toDateInputValue(a.scheduledAt) === toDateInputValue(now)).length;
      case "upcoming":
        return activities.filter(
          (a) =>
            getEffectiveStatus(a, now) !== "completed" &&
            getEffectiveStatus(a, now) !== "cancelled" &&
            new Date(a.scheduledAt).getTime() >= now.getTime(),
        ).length;
      case "overdue":
        return activities.filter((a) => getEffectiveStatus(a, now) === "overdue").length;
      case "completed":
        return activities.filter((a) => a.status === "completed").length;
      default:
        return activities.length;
    }
  };

  const hasFilters =
    workflowFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all" || dateFilter !== "";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card bodyClassName="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setView(v.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                view === v.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {v.label}
              <span
                className={cn(
                  "ml-1.5 text-xs tabular-nums",
                  view === v.value ? "text-indigo-200" : "text-slate-400",
                )}
              >
                {countFor(v.value)}
              </span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SelectInput
            value={workflowFilter}
            onChange={(e) => setWorkflowFilter(e.target.value)}
            aria-label="Filter by workflow"
          >
            <option value="all">All workflows</option>
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | "overdue" | "all")}
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
            aria-label="Filter by priority"
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </SelectInput>
          <TextInput
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filter by date"
          />
        </div>
      </Card>

      {/* Grouped list */}
      {groups.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title={hasFilters ? "No activities match these filters" : "No activities scheduled yet"}
          description={
            hasFilters
              ? "Try clearing a filter or picking a different day."
              : "Create activities in a workflow and they will appear here."
          }
        />
      ) : (
        <div className="space-y-4">
          {groups.map(({ key, items }) => (
            <Card
              key={key}
              title={dayLabel(items[0].scheduledAt)}
              subtitle={`${formatDate(items[0].scheduledAt)} · ${items.length} activity${items.length > 1 ? "ies" : ""}`}
              bodyClassName="p-0"
            >
              <ul className="divide-y divide-slate-100">
                {items.map((activity) => {
                  const effective = getEffectiveStatus(activity);
                  const isDone = effective === "completed" || effective === "cancelled";
                  return (
                    <li
                      key={activity.id}
                      className={cn(
                        "flex flex-wrap items-center gap-3 px-4 py-3",
                        effective === "overdue" && "border-l-2 border-l-rose-400",
                        isDone && "opacity-60",
                      )}
                    >
                      <div className="w-16 shrink-0 text-sm font-medium tabular-nums text-slate-700">
                        {formatTime(activity.scheduledAt)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/workflows/${activity.workflowId}`}
                          className={cn(
                            "block truncate text-sm font-medium text-slate-900 hover:text-indigo-600",
                            isDone && "text-slate-400 line-through",
                          )}
                        >
                          {activity.title}
                        </Link>
                        <p className="truncate text-xs text-slate-500">
                          {workflowNames[activity.workflowId]}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <StatusBadge status={effective} />
                        <PriorityBadge priority={activity.priority} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <CalendarDays className="size-3.5" />
        Showing {filtered.length} of {activities.length} activities
      </p>
    </div>
  );
}
