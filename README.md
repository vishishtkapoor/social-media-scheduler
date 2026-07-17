# LoopDesk

A production-quality workflow and scheduling management application — a lightweight
internal operations tool for tracking workflows, their scheduled activities, and
operational analytics.

## Stack

- **React 19 + TypeScript (strict)** — via Vite
- **Tailwind CSS v4** — styling
- **React Router v7** — routing
- **Recharts** — analytics charts
- **Lucide React** — icons
- **LocalStorage** — persistence (no backend in v1)

## Getting started

```bash
npm install
npm run dev
```

The app seeds itself with a realistic demo dataset (6 workflows, 20 activities) on
first launch. Reset it anytime from **Settings → Reset demo data**.

## Scripts

| Script               | Purpose                                  |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start the Vite dev server                |
| `npm run build`      | Typecheck (`tsc -b`) then production build |
| `npm run preview`    | Preview the production build             |
| `npm run typecheck`  | Typecheck without emitting               |

## Routes

| Route            | Page                                  |
| ---------------- | ------------------------------------- |
| `/`              | Redirects to `/dashboard`             |
| `/dashboard`     | Operational overview + key metrics    |
| `/workflows`     | Workflow list with search/filter      |
| `/workflows/:id` | Workflow detail + activity timeline   |
| `/schedule`      | Activities grouped by day             |
| `/analytics`     | Metrics and charts from live data     |
| `/settings`      | Workspace data / demo reset           |

## Domain model

- **Workflow** — `active`, `paused`, `completed`, `archived`
- **Activity** — `scheduled`, `in_progress`, `completed`, `cancelled`; priority
  `low | medium | high`
- **Overdue** is *derived*, never stored: an activity is overdue when
  `scheduledAt` is in the past and it isn't completed/cancelled.

Workflow progress is `completed / total activities` (0% when there are none).
Marking an activity complete stamps `completedAt`; reopening it clears the stamp.

## Architecture

```
src/
  types/        Centralized domain types
  data/         Seed data
  lib/          storage, store (reactive CRUD), analytics, date, status, labels, toast
  components/   Reusable UI (badges, modals, cards, tables, layout)
  pages/        Route-level pages
```

The reactive store (`src/lib/store.ts`) is the single mutation surface: every
component reads via `useWorkflows()` / `useActivities()` and writes through
`createWorkflow` / `updateActivity` / etc. All reads and writes go through
`src/lib/storage.ts`, so swapping LocalStorage for a real API later only touches
that one module (and the store's load/save calls).
