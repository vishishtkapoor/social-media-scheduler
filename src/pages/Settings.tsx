import { useState } from "react";
import { Database, RotateCcw } from "lucide-react";
import { resetDemoData } from "../lib/store";
import { toast } from "../lib/toast";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function Settings() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleReset() {
    resetDemoData();
    toast("Demo data reset", "info");
    setConfirmOpen(false);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card
        title="Workspace data"
        subtitle="LoopDesk stores all data locally in your browser"
        bodyClassName="space-y-4"
      >
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Database className="size-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">Local persistence</p>
            <p className="mt-0.5 text-sm text-slate-500">
              Workflows and activities are saved to LocalStorage on every change. Nothing leaves
              your browser in this version.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">Reset demo data</p>
            <p className="mt-0.5 text-sm text-slate-500">
              Restore the original sample workflows and activities, discarding your changes.
            </p>
          </div>
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Reset demo data"
        message="This discards all current workflows and activities and restores the original sample dataset. This cannot be undone."
        confirmLabel="Reset data"
        onConfirm={handleReset}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
