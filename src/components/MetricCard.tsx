import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";

type Tone = "default" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  default: "bg-indigo-50 text-indigo-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-rose-50 text-rose-600",
};

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: Tone;
}

export function MetricCard({ label, value, icon: Icon, hint, tone = "default" }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
            TONES[tone],
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
        {value}
      </p>
      {hint && <p className="mt-1 truncate text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
