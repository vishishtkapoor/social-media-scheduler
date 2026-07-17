import type { ActivityStatus } from "../types";
import { ACTIVITY_STATUS_LABELS } from "../lib/labels";

const STATUS_ORDER: ActivityStatus[] = ["scheduled", "in_progress", "completed", "cancelled"];

interface StatusSelectProps {
  value: ActivityStatus;
  onChange: (status: ActivityStatus) => void;
  disabled?: boolean;
}

export function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      aria-label="Activity status"
      onChange={(e) => onChange(e.target.value as ActivityStatus)}
      className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {STATUS_ORDER.map((status) => (
        <option key={status} value={status}>
          {ACTIVITY_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
