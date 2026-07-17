import { useEffect, useState } from "react";
import { Outlet, matchPath, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toasts } from "./Toasts";
import { AppSplash } from "./AppSplash";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Operational overview of workflows and scheduled activities",
  },
  "/workflows": {
    title: "Workflows",
    subtitle: "Create, track, and manage your operational workflows",
  },
  "/schedule": {
    title: "Schedule",
    subtitle: "Every scheduled activity, grouped by day",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Operational metrics calculated from your data",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Workspace preferences and data",
  },
};

function resolveMeta(pathname: string): { title: string; subtitle: string } {
  const exact = PAGE_META[pathname];
  if (exact) return exact;
  if (matchPath("/workflows/:id", pathname)) {
    return { title: "Workflow details", subtitle: "Activities, progress, and status" };
  }
  return { title: "LoopDesk", subtitle: "Workflow and scheduling operations" };
}

export function Layout() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const meta = resolveMeta(location.pathname);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (!ready) return <AppSplash />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
              className="absolute right-2 top-3 inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-4" />
            </button>
            <Sidebar mobile />
          </div>
        </div>
      )}
      <div className="min-h-screen lg:pl-20 xl:pl-64">
        <Header title={meta.title} subtitle={meta.subtitle} onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  );
}
