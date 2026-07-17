import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "../components/Button";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Compass className="size-6" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
