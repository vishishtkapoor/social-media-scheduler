import type { Activity, ActivityStatus, Priority, Workflow } from "../types";

/**
 * Realistic seed data. Dates are generated relative to "now" so the demo
 * always looks current: a mix of completed, in-progress, scheduled, overdue
 * (past date, still open) and cancelled activities across six workflows.
 */

function at(daysFromNow: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

const daysAgo = (n: number, hour: number, minute = 0): string =>
  new Date(at(-n, hour, minute).getTime()).toISOString();

const daysFromNow = (n: number, hour: number, minute = 0): string =>
  at(n, hour, minute).toISOString();

const workflows: Workflow[] = [
  {
    id: "wf-onboarding",
    name: "Customer Onboarding",
    description:
      "New-client onboarding pipeline: kickoff, requirements, provisioning, training and handoff.",
    status: "active",
    createdAt: daysAgo(45, 9),
    updatedAt: daysAgo(1, 16, 40),
  },
  {
    id: "wf-launch",
    name: "Product Launch",
    description:
      "Q3 release: feature freeze, QA, beta cohort, launch announcement and GA coordination.",
    status: "active",
    createdAt: daysAgo(30, 10),
    updatedAt: daysAgo(1, 9, 20),
  },
  {
    id: "wf-ops",
    name: "Weekly Operations",
    description:
      "Recurring operational cadence: planning, status syncs, capacity review and reporting.",
    status: "active",
    createdAt: daysAgo(60, 8),
    updatedAt: daysAgo(1, 11, 5),
  },
  {
    id: "wf-release",
    name: "Engineering Release",
    description:
      "v2.4 release pipeline: merge, staging deploy, production deploy and smoke tests.",
    status: "completed",
    createdAt: daysAgo(25, 9),
    updatedAt: daysAgo(9, 11, 30),
  },
  {
    id: "wf-vendor",
    name: "Vendor Migration",
    description:
      "Evaluation and migration off the legacy vendor platform. Parked after the contract ended.",
    status: "archived",
    createdAt: daysAgo(40, 14),
    updatedAt: daysAgo(13, 12, 10),
  },
  {
    id: "wf-audit",
    name: "Compliance Audit Prep",
    description:
      "Collect evidence and refresh policy documentation ahead of the annual security audit.",
    status: "paused",
    createdAt: daysAgo(20, 9),
    updatedAt: daysAgo(2, 10),
  },
];

interface SeedActivity {
  id: string;
  workflowId: string;
  title: string;
  description: string;
  scheduled: string;
  status: ActivityStatus;
  priority: Priority;
  createdDaysAgo: number;
  completed?: string;
  updated?: string;
}

function activity(input: SeedActivity): Activity {
  const createdAt = daysAgo(input.createdDaysAgo, 8, 30);
  return {
    id: input.id,
    workflowId: input.workflowId,
    title: input.title,
    description: input.description,
    scheduledAt: input.scheduled,
    status: input.status,
    priority: input.priority,
    createdAt,
    completedAt: input.completed ?? null,
    updatedAt: input.updated ?? input.completed ?? createdAt,
  };
}

const activities: Activity[] = [
  // Customer Onboarding
  activity({
    id: "act-kickoff",
    workflowId: "wf-onboarding",
    title: "Client kickoff call",
    description: "Intro call covering scope, stakeholders, and the success criteria for onboarding.",
    scheduled: daysAgo(12, 9),
    status: "completed",
    priority: "high",
    createdDaysAgo: 18,
    completed: daysAgo(12, 10, 30),
  }),
  activity({
    id: "act-requirements",
    workflowId: "wf-onboarding",
    title: "Collect business requirements",
    description: "Workshop to document workflows, integrations, and access needs for the new client.",
    scheduled: daysAgo(9, 14),
    status: "completed",
    priority: "medium",
    createdDaysAgo: 15,
    completed: daysAgo(9, 16, 15),
  }),
  activity({
    id: "act-provisioning",
    workflowId: "wf-onboarding",
    title: "Provision accounts and SSO",
    description: "Create user accounts, configure SSO, and assign role-based access.",
    scheduled: daysAgo(3, 10),
    status: "completed",
    priority: "high",
    createdDaysAgo: 8,
    completed: daysAgo(3, 11, 45),
  }),
  activity({
    id: "act-training",
    workflowId: "wf-onboarding",
    title: "Internal training session",
    description: "Hands-on walkthrough of the product for the client's operations team.",
    scheduled: daysFromNow(2, 13, 30),
    status: "scheduled",
    priority: "low",
    createdDaysAgo: 6,
  }),
  // Product Launch
  activity({
    id: "act-freeze",
    workflowId: "wf-launch",
    title: "Feature freeze sign-off",
    description: "Lock the release scope and get final sign-off from product and engineering.",
    scheduled: daysAgo(12, 16),
    status: "completed",
    priority: "high",
    createdDaysAgo: 15,
    completed: daysAgo(12, 17, 10),
  }),
  activity({
    id: "act-qa",
    workflowId: "wf-launch",
    title: "Final QA regression pass",
    description: "Full regression across core flows before the freeze window closes.",
    scheduled: daysAgo(6, 9),
    status: "completed",
    priority: "high",
    createdDaysAgo: 10,
    completed: daysAgo(5, 18, 30),
  }),
  activity({
    id: "act-beta",
    workflowId: "wf-launch",
    title: "Roll out beta cohort invites",
    description: "Invite 200 beta users in staged batches and monitor activation.",
    scheduled: daysAgo(2, 11),
    status: "in_progress",
    priority: "high",
    createdDaysAgo: 7,
    updated: daysAgo(1, 9),
  }),
  activity({
    id: "act-announcement",
    workflowId: "wf-launch",
    title: "Draft launch announcement",
    description: "Write the public announcement, changelog, and help-center updates.",
    scheduled: daysFromNow(1, 15),
    status: "scheduled",
    priority: "medium",
    createdDaysAgo: 3,
  }),
  activity({
    id: "act-release",
    workflowId: "wf-launch",
    title: "Coordinate GA release window",
    description: "Align engineering, marketing, and support around the GA date and go/no-go.",
    scheduled: daysFromNow(7, 9),
    status: "scheduled",
    priority: "high",
    createdDaysAgo: 4,
  }),
  // Weekly Operations
  activity({
    id: "act-ops-planning",
    workflowId: "wf-ops",
    title: "Monday ops planning",
    description: "Set priorities and assign owners for the week's operational work.",
    scheduled: daysAgo(8, 8, 30),
    status: "completed",
    priority: "medium",
    createdDaysAgo: 9,
    completed: daysAgo(8, 9, 15),
  }),
  activity({
    id: "act-ops-sync",
    workflowId: "wf-ops",
    title: "Mid-week status sync",
    description: "Review in-flight work, surface blockers, and re-balance load.",
    scheduled: daysAgo(4, 15),
    status: "completed",
    priority: "low",
    createdDaysAgo: 6,
    completed: daysAgo(4, 16),
  }),
  activity({
    id: "act-capacity",
    workflowId: "wf-ops",
    title: "Capacity review and staffing",
    description: "Assess team capacity for the next sprint and flag resourcing gaps.",
    scheduled: daysAgo(1, 14),
    status: "in_progress",
    priority: "high",
    createdDaysAgo: 4,
    updated: daysAgo(1, 9),
  }),
  activity({
    id: "act-kpi",
    workflowId: "wf-ops",
    title: "Weekly KPI report",
    description: "Compile the week's metrics and send the operations summary to leadership.",
    scheduled: daysFromNow(1, 17),
    status: "scheduled",
    priority: "medium",
    createdDaysAgo: 2,
  }),
  // Engineering Release
  activity({
    id: "act-merge",
    workflowId: "wf-release",
    title: "Merge release branch",
    description: "Final merge into main after QA sign-off.",
    scheduled: daysAgo(11, 10),
    status: "completed",
    priority: "high",
    createdDaysAgo: 14,
    completed: daysAgo(11, 11, 40),
  }),
  activity({
    id: "act-staging",
    workflowId: "wf-release",
    title: "Deploy to staging",
    description: "Cut release branch and deploy to staging for acceptance testing.",
    scheduled: daysAgo(10, 14),
    status: "completed",
    priority: "high",
    createdDaysAgo: 13,
    completed: daysAgo(10, 15, 20),
  }),
  activity({
    id: "act-prod",
    workflowId: "wf-release",
    title: "Production deploy and smoke test",
    description: "Deploy to production, run smoke tests, and monitor error rates for 24 hours.",
    scheduled: daysAgo(9, 9, 30),
    status: "completed",
    priority: "high",
    createdDaysAgo: 12,
    completed: daysAgo(9, 11, 5),
  }),
  // Vendor Migration
  activity({
    id: "act-vendor-review",
    workflowId: "wf-vendor",
    title: "Vendor security review",
    description: "Security assessment of the vendor platform — passed with no critical findings.",
    scheduled: daysAgo(13, 9),
    status: "completed",
    priority: "medium",
    createdDaysAgo: 16,
    completed: daysAgo(13, 12),
  }),
  activity({
    id: "act-vendor-dryrun",
    workflowId: "wf-vendor",
    title: "Data migration dry run",
    description: "Cancelled after the vendor contract ended — migration was abandoned.",
    scheduled: daysAgo(26, 14),
    status: "cancelled",
    priority: "medium",
    createdDaysAgo: 28,
  }),
  // Compliance Audit Prep
  activity({
    id: "act-audit-logs",
    workflowId: "wf-audit",
    title: "Gather access logs",
    description: "Collect 90 days of access logs from all production systems for the audit.",
    scheduled: daysAgo(5, 9),
    status: "scheduled",
    priority: "high",
    createdDaysAgo: 8,
    updated: daysAgo(2, 10),
  }),
  activity({
    id: "act-audit-policy",
    workflowId: "wf-audit",
    title: "Update policy documentation",
    description: "Refresh access control policies and addendums for the current quarter.",
    scheduled: daysFromNow(6, 11),
    status: "scheduled",
    priority: "medium",
    createdDaysAgo: 5,
  }),
];

export function buildSeedData(): { workflows: Workflow[]; activities: Activity[] } {
  return { workflows, activities };
}
