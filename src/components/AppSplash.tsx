import { Layers, Loader2 } from "lucide-react";

export function AppSplash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
        <Layers className="size-5" />
      </span>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin" />
        Loading workspace…
      </div>
    </div>
  );
}
