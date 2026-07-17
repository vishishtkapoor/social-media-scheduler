import { useMemo } from "react";
import {
  Activity as ActivityIcon,
  CheckCircle2,
  CircleDot,
  Gauge,
  Timer,
  Workflow as WorkflowIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
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
import {
  avgCompletionTime,
  completionRate,
  completedOverTime,
  countByStatus,
  overdueRate,
  priorityDistribution,
  workflowProgress,
} from "../lib/analytics";
import {
  EFFECTIVE_STATUS_LABELS,
  PRIORITY_CHART_COLORS,
  PRIORITY_LABELS,
  STATUS_CHART_COLORS,
} from "../lib/labels";
import { formatDuration } from "../lib/date";

const truncateName = (name: string): string =>
  name.length > 20 ? `${name.slice(0, 19)}…` : name;

const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
};

export function Analytics() {
  const workflows = useWorkflows();
  const activities = useActivities();

  const total = activities.length;
  const rate = useMemo(() => completionRate(activities), [activities]);
  const overduePct = useMemo(() => overdueRate(activities), [activities]);
  const avgTime = useMemo(() => avgCompletionTime(activities), [activities]);
  const activeWorkflows = workflows.filter((w) => w.status === "active").length;

  const trend = useMemo(() => completedOverTime(activities), [activities]);
  const byStatus = useMemo(() => countByStatus(activities), [activities]);
  const byPriority = useMemo(() => priorityDistribution(activities), [activities]);
  const comparison = useMemo(
    () =>
      workflows
        .map((w) => {
          const p = workflowProgress(w, activities);
          return { name: w.name, percent: p.percent, completed: p.completed, total: p.total };
        })
        .sort((a, b) => b.percent - a.percent),
    [workflows, activities],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <MetricCard label="Total activities" value={total} icon={ActivityIcon} />
        <MetricCard
          label="Completion rate"
          value={`${rate}%`}
          icon={CheckCircle2}
          tone="success"
          hint={`${activities.filter((a) => a.status === "completed").length} completed`}
        />
        <MetricCard
          label="Overdue rate"
          value={`${overduePct}%`}
          icon={CircleDot}
          tone="danger"
          hint="of all activities"
        />
        <MetricCard
          label="Avg. completion time"
          value={avgTime !== null ? formatDuration(avgTime) : "—"}
          icon={Timer}
          hint="from creation to completion"
        />
        <MetricCard
          label="Active workflows"
          value={activeWorkflows}
          icon={WorkflowIcon}
          hint={`of ${workflows.length} total`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Activities completed over time"
          subtitle="Daily completions, last 14 days"
          className="min-w-0"
        >
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
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
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Activities by status" subtitle="Effective status, including derived overdue" className="min-w-0">
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="status"
                  tickFormatter={(s) => EFFECTIVE_STATUS_LABELS[s as keyof typeof EFFECTIVE_STATUS_LABELS]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value} activities`,
                    EFFECTIVE_STATUS_LABELS[name as keyof typeof EFFECTIVE_STATUS_LABELS],
                  ]}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={36}>
                  {byStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Activities by priority" subtitle="Workload split across priority levels" className="min-w-0">
          <div className="flex h-64 min-w-0 flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6">
            <div className="h-56 w-full min-w-0 sm:w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byPriority}
                    dataKey="count"
                    nameKey="priority"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    strokeWidth={2}
                  >
                    {byPriority.map((entry) => (
                      <Cell key={entry.priority} fill={PRIORITY_CHART_COLORS[entry.priority]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} activities`,
                      PRIORITY_LABELS[name as keyof typeof PRIORITY_LABELS],
                    ]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="w-full space-y-1.5 sm:w-36">
              {byPriority.map((entry) => (
                <li key={entry.priority} className="flex items-center gap-2 text-xs">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: PRIORITY_CHART_COLORS[entry.priority] }}
                  />
                  <span className="flex-1 text-slate-600">{PRIORITY_LABELS[entry.priority]}</span>
                  <span className="font-semibold tabular-nums text-slate-800">{entry.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card
          title="Workflow progress comparison"
          subtitle="Percent complete per workflow"
          className="min-w-0"
        >
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={comparison}
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tickFormatter={truncateName}
                  tick={{ fontSize: 11, fill: "#475569" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value}%`,
                    name === "percent" ? "Progress" : "Activities",
                  ]}
                  labelFormatter={(label) => truncateName(String(label))}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="percent" radius={[0, 4, 4, 0]} barSize={16}>
                  {comparison.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.percent >= 100 ? "#10b981" : "#6366f1"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <Gauge className="size-3.5" />
        All metrics are calculated live from stored workflows and activities.
      </p>
    </div>
  );
}
