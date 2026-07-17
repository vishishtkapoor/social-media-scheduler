import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { dismissToast, useToasts } from "../lib/toast";

const ICONS = {
  success: <CheckCircle2 className="size-4.5 text-emerald-500" />,
  error: <XCircle className="size-4.5 text-rose-500" />,
  info: <Info className="size-4.5 text-sky-500" />,
};

export function Toasts() {
  const toasts = useToasts();
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-lg"
        >
          <span className="mt-0.5 shrink-0">{ICONS[t.tone]}</span>
          <p className="flex-1 text-sm font-medium text-slate-700">{t.message}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismissToast(t.id)}
            className="shrink-0 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
