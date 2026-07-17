import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

const CONTROL_CLASSES =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm " +
  "placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 " +
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, required, error, hint, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  className,
  invalid,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(CONTROL_CLASSES, invalid && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30", className)}
      {...rest}
    />
  );
}

export function TextArea({
  className,
  invalid,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(CONTROL_CLASSES, "min-h-20 resize-y", invalid && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30", className)}
      {...rest}
    />
  );
}

export function SelectInput({
  className,
  invalid,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={cn(CONTROL_CLASSES, "pr-8", invalid && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30", className)}
      {...rest}
    />
  );
}
