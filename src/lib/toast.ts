import { useSyncExternalStore } from "react";

export type ToastTone = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function toast(message: string, tone: ToastTone = "success"): void {
  const item: ToastItem = { id: nextId++, message, tone };
  toasts = [...toasts, item];
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== item.id);
    emit();
  }, 4000);
}

export function dismissToast(id: number): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToasts(): ToastItem[] {
  return useSyncExternalStore(subscribe, () => toasts);
}
