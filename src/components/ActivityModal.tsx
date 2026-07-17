import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Activity, ActivityDraft, ActivityStatus, Priority, Workflow } from "../types";
import { ACTIVITY_STATUS_LABELS, PRIORITY_LABELS } from "../lib/labels";
import { combineDateTime, toDateInputValue, toTimeInputValue } from "../lib/date";
import { Modal } from "./Modal";
import { Field, SelectInput, TextArea, TextInput } from "./form";
import { Button } from "./Button";

interface ActivityModalProps {
  open: boolean;
  workflows: Workflow[];
  initial?: Activity | null;
  onClose: () => void;
  onSubmit: (draft: ActivityDraft) => void;
}

const STATUS_ORDER: ActivityStatus[] = ["scheduled", "in_progress", "completed", "cancelled"];
const PRIORITY_ORDER: Priority[] = ["low", "medium", "high"];

interface FormState {
  title: string;
  description: string;
  workflowId: string;
  date: string;
  time: string;
  priority: Priority;
  status: ActivityStatus;
}

export function ActivityModal({ open, workflows, initial, onClose, onSubmit }: ActivityModalProps) {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    workflowId: "",
    date: "",
    time: "09:00",
    priority: "medium",
    status: "scheduled",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description,
        workflowId: initial.workflowId,
        date: toDateInputValue(initial.scheduledAt),
        time: toTimeInputValue(initial.scheduledAt),
        priority: initial.priority,
        status: initial.status,
      });
    } else {
      setForm({
        title: "",
        description: "",
        workflowId: workflows[0]?.id ?? "",
        date: toDateInputValue(new Date()),
        time: "09:00",
        priority: "medium",
        status: "scheduled",
      });
    }
    setErrors({});
  }, [open, initial, workflows]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.workflowId) next.workflowId = "Select a workflow.";
    if (!form.date) next.date = "Date is required.";
    if (!form.time) next.time = "Time is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      workflowId: form.workflowId,
      scheduledAt: combineDateTime(form.date, form.time),
      priority: form.priority,
      status: form.status,
    });
  }

  const valid = form.title.trim() !== "" && form.workflowId !== "" && form.date !== "" && form.time !== "";

  return (
    <Modal
      open={open}
      title={initial ? "Edit activity" : "Add activity"}
      subtitle={initial ? "Update the scheduled activity." : "Schedule a new activity in a workflow."}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Title" htmlFor="act-title" required error={errors.title}>
          <TextInput
            id="act-title"
            value={form.title}
            invalid={Boolean(errors.title)}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Final QA regression pass"
            autoFocus
          />
        </Field>
        <Field label="Description" htmlFor="act-description">
          <TextArea
            id="act-description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What needs to happen, and by whom?"
          />
        </Field>
        <Field label="Workflow" htmlFor="act-workflow" required error={errors.workflowId}>
          <SelectInput
            id="act-workflow"
            value={form.workflowId}
            invalid={Boolean(errors.workflowId)}
            onChange={(e) => set("workflowId", e.target.value)}
          >
            <option value="" disabled>
              Select a workflow…
            </option>
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" htmlFor="act-date" required error={errors.date}>
            <TextInput
              id="act-date"
              type="date"
              value={form.date}
              invalid={Boolean(errors.date)}
              onChange={(e) => set("date", e.target.value)}
            />
          </Field>
          <Field label="Time" htmlFor="act-time" required error={errors.time}>
            <TextInput
              id="act-time"
              type="time"
              value={form.time}
              invalid={Boolean(errors.time)}
              onChange={(e) => set("time", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority" htmlFor="act-priority">
            <SelectInput
              id="act-priority"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value as Priority)}
            >
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Status" htmlFor="act-status">
            <SelectInput
              id="act-status"
              value={form.status}
              onChange={(e) => set("status", e.target.value as ActivityStatus)}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {ACTIVITY_STATUS_LABELS[s]}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!valid}>
            {initial ? "Save changes" : "Add activity"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
