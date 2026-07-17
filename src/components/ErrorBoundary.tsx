import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("LoopDesk crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
          <span className="flex size-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <AlertTriangle className="size-6" />
          </span>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              An unexpected error occurred. Your data is safe in local storage — try reloading the
              app.
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>Reload LoopDesk</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
