import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors",
        "hover:bg-slate-100 hover:text-slate-700",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...rest}
    />
  );
}
