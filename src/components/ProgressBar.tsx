import { cn } from "../lib/cn";

interface ProgressBarProps {
  value: number;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

function autoTone(value: number): string {
  if (value >= 100) return "bg-emerald-500";
  if (value >= 40) return "bg-indigo-500";
  if (value >= 10) return "bg-amber-500";
  return "bg-rose-500";
}

export function ProgressBar({ value, size = "md", showLabel = false, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const height = size === "sm" ? "h-1.5" : "h-2";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-full overflow-hidden rounded-full bg-slate-100", height)}>
        <div
          className={cn("h-full rounded-full transition-all duration-300", autoTone(clamped))}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-slate-600">
          {clamped}%
        </span>
      )}
    </div>
  );
}
