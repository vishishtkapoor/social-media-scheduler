import { useMemo, useState } from "react";
import { FolderOpen, Plus, Search } from "lucide-react";
import type { Workflow, WorkflowDraft, WorkflowStatus } from "../types";
import { useActivities, useWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } from "../lib/store";
import { toast } from "../lib/toast";
import { WorkflowTable } from "../components/WorkflowTable";
import { WorkflowCard } from "../components/WorkflowCard";
import { WorkflowModal } from "../components/WorkflowModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { SelectInput, TextInput } from "../components/form";

const STATUS_FILTERS: Array<{ value: WorkflowStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

type ModalState = { mode: "create" } | { mode: "edit"; workflow: Workflow } | null;

export function Workflows() {
  const workflows = useWorkflows();
  const activities = useActivities();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | "all">("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Workflow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workflows
      .filter((w) => statusFilter === "all" || w.status === statusFilter)
      .filter(
        (w) =>
          !q ||
          w.name.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [workflows, query, statusFilter]);

  function handleSubmit(draft: WorkflowDraft) {
    if (modal?.mode === "edit") {
      updateWorkflow(modal.workflow.id, draft);
      toast("Workflow updated");
    } else {
      createWorkflow(draft);
      toast("Workflow created");
    }
    setModal(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteWorkflow(deleteTarget.id);
    toast("Workflow deleted");
    setDeleteTarget(null);
  }

  const noMatches = filtered.length === 0 && (query !== "" || statusFilter !== "all");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workflows…"
              className="pl-9"
              aria-label="Search workflows"
            />
          </div>
          <SelectInput
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as WorkflowStatus | "all")}
            className="sm:w-44"
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </SelectInput>
        </div>
        <Button onClick={() => setModal({ mode: "create" })}>
          <Plus className="size-4" />
          Create Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Create your first workflow to start organizing scheduled activities."
          description="Workflows group related scheduled activities, track their progress, and feed your operational analytics."
          action={
            <Button onClick={() => setModal({ mode: "create" })}>
              <Plus className="size-4" />
              Create Workflow
            </Button>
          }
        />
      ) : noMatches ? (
        <EmptyState
          icon={Search}
          title="No workflows match your search"
          description="Try a different search term or clear the status filter."
        />
      ) : (
        <>
          <div className="hidden md:block">
            <WorkflowTable
              workflows={filtered}
              activities={activities}
              onEdit={(w) => setModal({ mode: "edit", workflow: w })}
              onDelete={setDeleteTarget}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
            {filtered.map((w) => (
              <WorkflowCard
                key={w.id}
                workflow={w}
                activities={activities}
                onEdit={(workflow) => setModal({ mode: "edit", workflow })}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        </>
      )}

      <WorkflowModal
        open={modal !== null}
        initial={modal?.mode === "edit" ? modal.workflow : null}
        onClose={() => setModal(null)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete workflow"
        message={`Deleting "${deleteTarget?.name ?? ""}" will also remove all ${activities.filter((a) => a.workflowId === deleteTarget?.id).length} activities in it. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
