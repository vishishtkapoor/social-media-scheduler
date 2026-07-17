import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Workflow, WorkflowDraft, WorkflowStatus } from "../types";
import { WORKFLOW_STATUS_LABELS } from "../lib/labels";
import { Modal } from "./Modal";
import { Field, SelectInput, TextArea, TextInput } from "./form";
import { Button } from "./Button";

interface WorkflowModalProps {
  open: boolean;
  initial?: Workflow | null;
  onClose: () => void;
  onSubmit: (draft: WorkflowDraft) => void;
}

const STATUS_ORDER: WorkflowStatus[] = ["active", "paused", "completed", "archived"];

export function WorkflowModal({ open, initial, onClose, onSubmit }: WorkflowModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<WorkflowStatus>("active");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setStatus(initial?.status ?? "active");
    setError(null);
  }, [open, initial]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Workflow name is required.");
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      status,
    });
  }

  return (
    <Modal
      open={open}
      title={initial ? "Edit workflow" : "Create workflow"}
      subtitle={initial ? "Update the workflow details." : "Start organizing scheduled activities."}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Name" htmlFor="wf-name" required error={error ?? undefined}>
          <TextInput
            id="wf-name"
            value={name}
            invalid={Boolean(error)}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Customer Onboarding"
            autoFocus
          />
        </Field>
        <Field label="Description" htmlFor="wf-description">
          <TextArea
            id="wf-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this workflow cover?"
          />
        </Field>
        <Field label="Status" htmlFor="wf-status">
          <SelectInput id="wf-status" value={status} onChange={(e) => setStatus(e.target.value as WorkflowStatus)}>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {WORKFLOW_STATUS_LABELS[s]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {initial ? "Save changes" : "Create workflow"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
