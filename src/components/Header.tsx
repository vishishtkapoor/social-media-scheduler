import { Menu } from "lucide-react";
import { formatDate } from "../lib/date";

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenu: () => void;
}

export function Header({ title, subtitle, onMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open navigation"
          className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="hidden truncate text-xs text-slate-500 sm:block">{subtitle}</p>
        </div>
        <p className="hidden shrink-0 text-xs font-medium text-slate-500 md:block">
          {formatDate(new Date())}
        </p>
      </div>
    </header>
  );
}
