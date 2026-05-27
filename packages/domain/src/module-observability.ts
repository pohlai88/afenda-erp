import type { ModuleId } from "@afenda/config/module-ids";

export type ModuleTone = "neutral" | "positive" | "warning";

export type ModuleObservabilityIndicator = {
  label: string;
  value: string;
  detail: string;
  tone: ModuleTone;
};

const moduleObservabilityIndicators: Record<
  ModuleId,
  readonly ModuleObservabilityIndicator[]
> = {
  dashboard: [
    {
      label: "Median route render",
      value: "184ms",
      detail: "Server-rendered dashboard payload inside the current target.",
      tone: "positive",
    },
    {
      label: "Trace coverage",
      value: "92%",
      detail: "Critical navigation paths emit structured traces.",
      tone: "positive",
    },
  ],
  finance: [
    {
      label: "Report freshness",
      value: "59m",
      detail: "Finance summaries refreshed within the hourly SLA.",
      tone: "positive",
    },
    {
      label: "Exception capture",
      value: "100%",
      detail:
        "Invoice hold routes are mapped into audit and queue instrumentation.",
      tone: "positive",
    },
  ],
  sales: [
    {
      label: "Order blocker visibility",
      value: "04",
      detail: "Commercial blockers are surfaced before invoice handoff.",
      tone: "warning",
    },
    {
      label: "Activity lag",
      value: "1.2d",
      detail: "Mean delay before a stalled account receives a next step.",
      tone: "neutral",
    },
  ],
  purchasing: [
    {
      label: "Approval latency",
      value: "5h 40m",
      detail: "Median time for spend-bound approvals in the last week.",
      tone: "warning",
    },
    {
      label: "Receipt telemetry",
      value: "88%",
      detail: "Inbound events mapped to receiving traces and queue events.",
      tone: "neutral",
    },
  ],
  inventory: [
    {
      label: "Variance detection",
      value: "97%",
      detail: "Movement anomalies surfaced before daily close.",
      tone: "positive",
    },
    {
      label: "Low-stock signal lag",
      value: "11m",
      detail: "Time between threshold breach and route visibility.",
      tone: "neutral",
    },
  ],
  hr: [
    {
      label: "Policy trace coverage",
      value: "76%",
      detail: "Leave and profile workflows still need broader instrumentation.",
      tone: "warning",
    },
    {
      label: "Sensitive mutation review",
      value: "Planned",
      detail: "Admin-grade logging is required before HR mutations go live.",
      tone: "warning",
    },
  ],
  crm: [
    {
      label: "Saved-view usage",
      value: "41%",
      detail: "Commercial teams reuse reporting presets for account reviews.",
      tone: "positive",
    },
    {
      label: "Engagement freshness",
      value: "84%",
      detail: "Tracked accounts have recent activity metadata.",
      tone: "neutral",
    },
  ],
  approvals: [
    {
      label: "Escalation capture",
      value: "100%",
      detail: "All escalated tasks emit queue and audit events.",
      tone: "positive",
    },
    {
      label: "SLA risk",
      value: "03",
      detail: "Escalated requests outside the target review window.",
      tone: "warning",
    },
  ],
  reports: [
    {
      label: "Export success rate",
      value: "99.2%",
      detail: "Scheduled and on-demand report delivery remains within target.",
      tone: "positive",
    },
    {
      label: "Snapshot staleness",
      value: "01",
      detail: "One report projection missed the freshness budget.",
      tone: "warning",
    },
  ],
  admin: [
    {
      label: "Privileged action logging",
      value: "Planned",
      detail: "Tenant-setting mutations must emit dedicated governance logs.",
      tone: "warning",
    },
    {
      label: "Membership review cadence",
      value: "Weekly",
      detail: "Role assignments are reviewed on a recurring schedule.",
      tone: "neutral",
    },
  ],
};

export function getModuleObservabilityIndicators(moduleId: ModuleId) {
  return moduleObservabilityIndicators[moduleId];
}
