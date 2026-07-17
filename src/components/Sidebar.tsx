import { NavLink } from "react-router-dom";
import {
  BarChart3,
  CalendarClock,
  CircleUser,
  Layers,
  LayoutDashboard,
  Settings,
  Workflow,
} from "lucide-react";
import { toast } from "../lib/toast";
import { cn } from "../lib/cn";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workflows", label: "Workflows", icon: Workflow },
  { to: "/schedule", label: "Schedule", icon: CalendarClock },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

function SidebarContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-3 py-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
          <Layers className="size-4" />
        </span>
        <span className="hidden xl:block">
          <span className="block text-sm font-semibold tracking-tight text-slate-900">
            LoopDesk
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-400">
            Operations
          </span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-2">
        <p className="hidden px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 xl:block">
          Overview
        </p>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "justify-center xl:justify-start",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )
            }
          >
            <Icon className="size-4.5 shrink-0" />
            <span className="hidden xl:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-slate-100 px-2 py-3">
        <button
          type="button"
          onClick={() => toast("Settings are coming soon.", "info")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 justify-center xl:justify-start"
        >
          <Settings className="size-4.5 shrink-0" />
          <span className="hidden xl:inline">Settings</span>
        </button>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <CircleUser className="size-5" />
          </span>
          <span className="hidden min-w-0 xl:block">
            <span className="block truncate text-sm font-medium text-slate-900">Ops Team</span>
            <span className="block truncate text-xs text-slate-500">Internal workspace</span>
          </span>
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  /** Rendered as a mobile drawer when true, fixed rail otherwise. */
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  if (mobile) {
    return (
      <aside className="flex h-full w-72 flex-col overflow-y-auto border-r border-slate-200 bg-white">
        <SidebarContent />
      </aside>
    );
  }
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-20 overflow-y-auto border-r border-slate-200 bg-white lg:block xl:w-64">
      <SidebarContent />
    </aside>
  );
}
