import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Workflow as WorkflowIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useActivities, useWorkflows } from "../lib/store";
import { MetricCard } from "../components/MetricCard";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { ProgressBar } from "../components/ProgressBar";
import { WorkflowStatusBadge } from "../components/WorkflowStatusBadge";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/Button";
import {
  completedOverTime,
  completionRate,
  getOverdueActivities,
  getRecentActivities,
  getUpcomingActivities,
  workflowProgress,
  workflowStatusDistribution,
} from "../lib/analytics";
import { WORKFLOW_STATUS_CHART_COLORS, WORKFLOW_STATUS_LABELS } from "../lib/labels";
import { dayLabel, formatTime, timeAgo } from "../lib/date";

export function Dashboard() {
  const workflows = useWorkflows();
  const activities = useActivities();

  const now = useMemo(() => new Date(), []);
  const workflowName = useMemo(() => {
    const map: Record<string, string> = {};
    for (const w of workflows) map[w.id] = w.name;
    return map;
  }, [workflows]);

  const activeWorkflows = workflows.filter((w) => w.status === "active").length;
  const scheduledCount = activities.filter(
    (a) => a.status === "scheduled" || a.status === "in_progress",
  ).length;
  const inProgressCount = activities.filter((a) => a.status === "in_progress").length;
  const completedCount = activities.filter((a) => a.status === "completed").length;
  const overdue = getOverdueActivities(activities, now);
  const rate = completionRate(activities);

  const trend = useMemo(() => completedOverTime(activities), [activities]);
  const statusDist = useMemo(() => workflowStatusDistribution(workflows), [workflows]);
  const upcoming = useMemo(() => getUpcomingActivities(activities, new Date(), 6), [activities]);
  const recent = useMemo(() => getRecentActivities(activities, 6), [activities]);
  const progressList = useMemo(
    () =>
      workflows
        .map((w) => workflowProgress(w, activities))
        .sort((a, b) => b.percent - a.percent),
    [workflows, activities],
  );

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          label="Active workflows"
          value={activeWorkflows}
          icon={WorkflowIcon}
          hint={`of ${workflows.length} total workflows`}
        />
        <MetricCard
          label="Scheduled"
          value={scheduledCount}
          icon={CalendarClock}
          hint={`${inProgressCount} in progress`}
        />
        <MetricCard
          label="Completed"
          value={completedCount}
          icon={CheckCircle2}
          tone="success"
          hint={`${rate}% completion rate`}
        />
        <MetricCard
          label="Overdue"
          value={overdue.length}
          icon={AlertTriangle}
          tone="danger"
          hint="need attention"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          title="Activity completion"
          subtitle="Completed activities over the last 14 days"
          className="min-w-0 lg:col-span-2"
        >
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value} activities`, "Completed"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#completionGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Workflow status" subtitle="Distribution across all workflows" className="min-w-0">
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={2}
                  strokeWidth={2}
                >
                  {statusDist.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={WORKFLOW_STATUS_CHART_COLORS[entry.status]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} workflows`,
                    WORKFLOW_STATUS_LABELS[name as keyof typeof WORKFLOW_STATUS_LABELS],
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {statusDist.map((entry) => (
              <li key={entry.status} className="flex items-center gap-2 text-xs">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: WORKFLOW_STATUS_CHART_COLORS[entry.status] }}
                />
                <span className="flex-1 text-slate-600">{WORKFLOW_STATUS_LABELS[entry.status]}</span>
                <span className="font-semibold tabular-nums text-slate-800">{entry.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Upcoming + recent activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          title="Upcoming activities"
          subtitle="Next on the schedule"
          className="lg:col-span-2"
          bodyClassName="p-0"
          action={
            <Link
              to="/schedule"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
            >
              View schedule <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={CalendarClock}
                title="No upcoming activities"
                description="Nothing is scheduled ahead of now."
              />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((activity) => (
                <li key={activity.id}>
                  <Link
                    to={`/workflows/${activity.workflowId}`}
                    className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50"
                  >
                    <div className="w-24 shrink-0">
                      <p className="text-xs font-semibold text-slate-700">
                        {dayLabel(activity.scheduledAt)}
                      </p>
                      <p className="text-xs text-slate-500">{formatTime(activity.scheduledAt)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {activity.title}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {workflowName[activity.workflowId]}
                      </p>
                    </div>
                    <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                      <StatusBadge status={activity.status} />
                      <PriorityBadge priority={activity.priority} />
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Recent activity"
          subtitle="Latest updates across workflows"
          bodyClassName="p-0"
        >
          {recent.length === 0 ? (
            <div className="p-4">
              <EmptyState icon={Clock} title="No activity yet" />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((activity) => (
                <li key={activity.id}>
                  <Link
                    to={`/workflows/${activity.workflowId}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {activity.title}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {workflowName[activity.workflowId]}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={activity.status} />
                      <span className="text-xs text-slate-400">{timeAgo(activity.updatedAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Workflow progress */}
      <Card
        title="Workflow progress"
        subtitle="Completion across all workflows"
        bodyClassName="p-0"
        action={
          <Link
            to="/workflows"
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
          >
            All workflows <ArrowRight className="size-3.5" />
          </Link>
        }
      >
        {progressList.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={WorkflowIcon}
              title="No workflows yet"
              description="Create your first workflow to start organizing scheduled activities."
              action={
                <Link to="/workflows">
                  <Button size="sm">Create a workflow</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {progressList.map(({ workflow, percent, total, completed }) => (
              <li key={workflow.id}>
                <Link
                  to={`/workflows/${workflow.id}`}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">{workflow.name}</p>
                      <WorkflowStatusBadge status={workflow.status} />
                    </div>
                    <ProgressBar value={percent} size="sm" className="mt-2 max-w-md" />
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-semibold tabular-nums text-slate-900">{percent}%</p>
                    <p className="text-xs text-slate-500">
                      {completed} of {total} activities
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
