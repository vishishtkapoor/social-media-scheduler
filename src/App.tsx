import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";

function lazyPage<T extends { [K in string]: unknown }>(
  factory: () => Promise<T>,
  name: keyof T & string,
) {
  return lazy(() => factory().then((m) => ({ default: m[name] as ComponentType })));
}

const Dashboard = lazyPage(() => import("./pages/Dashboard"), "Dashboard");
const Workflows = lazyPage(() => import("./pages/Workflows"), "Workflows");
const WorkflowDetails = lazyPage(() => import("./pages/WorkflowDetails"), "WorkflowDetails");
const Schedule = lazyPage(() => import("./pages/Schedule"), "Schedule");
const Analytics = lazyPage(() => import("./pages/Analytics"), "Analytics");
const Settings = lazyPage(() => import("./pages/Settings"), "Settings");
const NotFound = lazyPage(() => import("./pages/NotFound"), "NotFound");

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-24 text-slate-400">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/workflows"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Workflows />
                </Suspense>
              }
            />
            <Route
              path="/workflows/:id"
              element={
                <Suspense fallback={<PageFallback />}>
                  <WorkflowDetails />
                </Suspense>
              }
            />
            <Route
              path="/schedule"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Schedule />
                </Suspense>
              }
            />
            <Route
              path="/analytics"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Analytics />
                </Suspense>
              }
            />
            <Route
              path="/settings"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Settings />
                </Suspense>
              }
            />
            <Route
              path="*"
              element={
                <Suspense fallback={<PageFallback />}>
                  <NotFound />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
