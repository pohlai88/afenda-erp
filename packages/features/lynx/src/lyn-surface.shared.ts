import {
  buildGovernedListSurface,
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
  type ListSurfaceRow,
  type ListSurfaceRowTone,
  type ListColumn,
  type StatCardConfigurationResolvedInput,
  type StatCardTone,
} from "@afenda/governed-surface";
import { LYNX_ERP_HTTP_ROUTES } from "../contracts/lynx.core.contract";
import type { LynxQualityGateResult } from "../contracts/lynx.evidence-trust.contract";
import type {
  LynxModuleReadiness,
  LynxReadinessSignal,
  LynxReadinessSnapshot,
  LynxReadinessStatus,
  LynxToolAvailability,
} from "../contracts/lynx.readiness.contract";

const LYNX_MONITOR_CONFIGURE_APPROVE_REASON =
  "Requires system-admin.lynx.approve.";

export const lynxOutcomeMonitorControlSurfaceKey =
  "system-admin.lynx-outcome-monitors.list";

export type LynxActivityLedgerRow = {
  id: string;
  kind: string;
  label: string;
  detail: string;
  status: string;
  moduleId: string;
  createdAt: string;
  href?: string;
};

export type LynxRunEventTimelineRow = {
  id: string;
  eventType: string;
  summary: string;
  toolName: string;
  evidenceCount: string;
  validation: string;
  approvalProposalId: string;
  sandboxId: string;
  createdAt: string;
};

export type LynxRunFeedbackRow = {
  id: string;
  rating: string;
  category: string;
  note: string;
  createdAt: string;
};

export type LynxRunManagementRow = {
  id: string;
  promptSummary: string;
  route: string;
  workflowId: string;
  model: string;
  status: string;
  latency: string;
  qualityGate: string;
  unsupportedClaims: string;
  startedAt: string;
  href: string;
};

export type LynxWorkflowSessionRow = {
  id: string;
  promptSummary: string;
  workflowId: string;
  origin: string;
  monitorStatus: string;
  severity: string;
  ownerAuthUserId?: string;
  status: string;
  currentStage: string;
  latestRunId: string;
  qualityGate: string;
  nextRecommendedStep: string;
  updatedAt: string;
  href: string;
};

export type LynxObservabilityLatencyRow = {
  id: string;
  route: string;
  workflowId: string;
  model: string;
  runCount: string;
  p50LatencyMs: string;
  p95LatencyMs: string;
  maxLatencyMs: string;
};

export type LynxObservabilityQualityRow = {
  id: string;
  workflowId: string;
  route: string;
  failedQualityGateCount: string;
  unsupportedClaimCount: string;
  lowCitationPrecisionCount: string;
};

export type LynxProactiveOutcomeAnalyticsRow = {
  id: string;
  monitorId: string;
  status: string;
  severity: string;
  count: string;
};

export type LynxOutcomeMonitorControlRow = {
  id: string;
  monitorId: string;
  enabled: string;
  ownerAuthUserId: string;
  thresholds: string;
  severityPolicy: string;
  updatedAt: string;
};

export type LynxSpendAnalyticsRow = {
  id: string;
  feature: string;
  model: string;
  provider: string;
  totalRequests: string;
  totalTokens: string;
  estimatedCostUsd: string;
};

export type LynxRepresentativeEvalFailureRow = {
  id: string;
  caseId: string;
  query: string;
  reasons: string;
  semanticGrade: string;
  observedAnswer: string;
  retrievedEvidence: string;
  createdAt: string;
};

export type LynxWorkflowSessionFilters = {
  status?: string;
  origin?: string;
  monitorStatus?: string;
  severity?: string;
};

export type LynxRunManagementFilters = {
  status?: string;
  route?: string;
  workflowId?: string;
  model?: string;
  toolName?: string;
  qualityGate?: "unsupported" | "lowCitationPrecision" | "failedQualityGate";
  origin?: string;
  monitorStatus?: string;
  severity?: string;
  provider?: string;
  search?: string;
};

export type LynxRouteListPagination = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type LynxClaimValidationRow = {
  id: string;
  claim: string;
  status: string;
  evidence: string;
  reason: string;
};

export type LynxFailedEvalCaseRow = {
  id: string;
  workflowId: string;
  moduleId: string;
  status: string;
  unsupportedClaims: string;
  citationPrecision: string;
  reason: string;
  href?: string;
};

const LYNX_READINESS_MODULE_COLUMNS = [
  {
    id: "module",
    header: "Module",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 180,
  },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "records", header: "Records" },
  { id: "workItems", header: "Work" },
  { id: "documents", header: "Documents" },
  { id: "nextAction", header: "Safe next action", wrap: true },
];

const LYNX_ENTERPRISE_CONTROL_COLUMNS = [
  {
    id: "control",
    header: "Control",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 200,
  },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "value", header: "Value" },
  { id: "detail", header: "Detail", wrap: true },
];

const LYNX_TOOL_AVAILABILITY_COLUMNS = [
  {
    id: "tool",
    header: "Tool",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 220,
  },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "reason", header: "Reason", wrap: true },
];

const LYNX_ACTIVITY_LEDGER_COLUMNS = [
  {
    id: "label",
    header: "Event",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 220,
  },
  { id: "kind", header: "Kind", cellKind: { kind: "badge" as const } },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "module", header: "Module" },
  { id: "createdAt", header: "Recorded" },
  { id: "detail", header: "Detail", wrap: true },
];

const LYNX_RUN_MANAGEMENT_COLUMNS = [
  {
    id: "promptSummary",
    header: "Run",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 240,
  },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "route", header: "Route" },
  { id: "workflowId", header: "Workflow" },
  { id: "model", header: "Model" },
  {
    id: "qualityGate",
    header: "Quality",
    cellKind: { kind: "badge" as const },
  },
  { id: "unsupportedClaims", header: "Unsupported" },
  { id: "latency", header: "Latency" },
  { id: "startedAt", header: "Started" },
];

const LYNX_WORKFLOW_SESSION_COLUMNS = [
  {
    id: "promptSummary",
    header: "Workflow",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 240,
  },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "origin", header: "Origin", cellKind: { kind: "badge" as const } },
  {
    id: "monitorStatus",
    header: "Monitor",
    cellKind: { kind: "badge" as const },
  },
  { id: "severity", header: "Severity", cellKind: { kind: "badge" as const } },
  { id: "ownerAuthUserId", header: "Owner", wrap: true },
  { id: "workflowId", header: "Type" },
  { id: "currentStage", header: "Stage" },
  {
    id: "qualityGate",
    header: "Quality",
    cellKind: { kind: "badge" as const },
  },
  { id: "latestRunId", header: "Latest run" },
  { id: "updatedAt", header: "Updated" },
  { id: "nextRecommendedStep", header: "Next step", wrap: true },
];

const LYNX_OBSERVABILITY_LATENCY_COLUMNS = [
  { id: "route", header: "Route", priority: "primary" as const, wrap: true },
  { id: "workflowId", header: "Workflow" },
  { id: "model", header: "Model", wrap: true },
  { id: "runCount", header: "Runs" },
  { id: "p50LatencyMs", header: "P50" },
  { id: "p95LatencyMs", header: "P95" },
  { id: "maxLatencyMs", header: "Max" },
];

const LYNX_OBSERVABILITY_QUALITY_COLUMNS = [
  {
    id: "workflowId",
    header: "Workflow",
    priority: "primary" as const,
    wrap: true,
  },
  { id: "route", header: "Route", wrap: true },
  { id: "failedQualityGateCount", header: "Failed gates" },
  { id: "unsupportedClaimCount", header: "Unsupported" },
  { id: "lowCitationPrecisionCount", header: "Low citations" },
];

const LYNX_PROACTIVE_OUTCOME_COLUMNS = [
  {
    id: "monitorId",
    header: "Monitor",
    priority: "primary" as const,
    wrap: true,
  },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "severity", header: "Severity", cellKind: { kind: "badge" as const } },
  { id: "count", header: "Count" },
];

const LYNX_MONITOR_CONTROL_COLUMNS = [
  {
    id: "monitorId",
    header: "Monitor",
    priority: "primary" as const,
    wrap: true,
  },
  { id: "enabled", header: "Enabled", cellKind: { kind: "badge" as const } },
  { id: "ownerAuthUserId", header: "Owner", wrap: true },
  { id: "thresholds", header: "Thresholds", wrap: true },
  { id: "severityPolicy", header: "Severity policy", wrap: true },
  { id: "updatedAt", header: "Updated" },
];

const LYNX_SPEND_ANALYTICS_COLUMNS = [
  { id: "feature", header: "Feature", priority: "primary" as const },
  { id: "model", header: "Model", wrap: true },
  { id: "provider", header: "Provider" },
  { id: "totalRequests", header: "Requests" },
  { id: "totalTokens", header: "Tokens" },
  { id: "estimatedCostUsd", header: "Cost" },
];

const LYNX_REPRESENTATIVE_EVAL_FAILURE_COLUMNS = [
  {
    id: "caseId",
    header: "Case",
    priority: "primary" as const,
    wrap: true,
  },
  { id: "query", header: "Query", wrap: true },
  { id: "reasons", header: "Reasons", wrap: true },
  {
    id: "semanticGrade",
    header: "Semantic",
    cellKind: { kind: "badge" as const },
  },
  { id: "retrievedEvidence", header: "Evidence" },
  { id: "observedAnswer", header: "Observed", wrap: true },
  { id: "createdAt", header: "Recorded" },
];

const LYNX_RUN_EVENT_TIMELINE_COLUMNS = [
  {
    id: "eventType",
    header: "Event",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 220,
  },
  { id: "toolName", header: "Tool" },
  { id: "evidenceCount", header: "Evidence" },
  { id: "validation", header: "Validation" },
  { id: "approvalProposalId", header: "Approval" },
  { id: "sandboxId", header: "Sandbox" },
  { id: "createdAt", header: "Recorded" },
  { id: "summary", header: "Summary", wrap: true },
];

const LYNX_RUN_FEEDBACK_COLUMNS = [
  {
    id: "rating",
    header: "Rating",
    priority: "primary" as const,
    pin: "start" as const,
    cellKind: { kind: "badge" as const },
  },
  { id: "category", header: "Category", cellKind: { kind: "badge" as const } },
  { id: "note", header: "Note", wrap: true },
  { id: "createdAt", header: "Recorded" },
];

const LYNX_CLAIM_VALIDATION_COLUMNS = [
  {
    id: "claim",
    header: "Claim",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 260,
  },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "evidence", header: "Evidence", wrap: true },
  { id: "reason", header: "Reason", wrap: true },
];

const LYNX_FAILED_EVAL_CASE_COLUMNS = [
  {
    id: "workflowId",
    header: "Workflow",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
  },
  { id: "moduleId", header: "Module" },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "unsupportedClaims", header: "Unsupported" },
  { id: "citationPrecision", header: "Citation precision" },
  { id: "reason", header: "Reason", wrap: true },
];

function readinessTone(status: LynxReadinessStatus): StatCardTone {
  if (status === "available") return "positive";
  if (status === "partial") return "attention";
  return "critical";
}

function rowToneForStatus(status: string): ListSurfaceRowTone {
  if (
    status === "blocked" ||
    status === "failed" ||
    status === "output-denied" ||
    status === "rejected" ||
    status === "unavailable" ||
    status === "unsupported" ||
    status.endsWith(".failed")
  ) {
    return "critical";
  }

  if (
    status === "partial" ||
    status === "pending" ||
    status === "partially_supported" ||
    status === "approval-requested" ||
    status === "approval-responded" ||
    status === "review" ||
    status === "started" ||
    status === "proposed"
  ) {
    return "attention";
  }

  return "default";
}

function rowToneForWorkflowSession(
  row: LynxWorkflowSessionRow,
): ListSurfaceRowTone {
  if (row.monitorStatus === "blocked" || row.severity === "critical") {
    return "critical";
  }

  if (row.monitorStatus === "watch" || row.severity === "review") {
    return "attention";
  }

  return rowToneForStatus(row.status);
}

function signalValue(
  module: LynxModuleReadiness,
  signalId: "records" | "work-items" | "documents",
) {
  return module.signals.find((signal) => signal.id === signalId)?.value ?? "0";
}

export function buildLynxReadinessStatGrid(input: {
  snapshot: LynxReadinessSnapshot;
}): StatCardConfigurationResolvedInput {
  const readyModules = input.snapshot.modules.filter(
    (module) => module.status === "available",
  ).length;
  const controlWarnings = input.snapshot.enterpriseControls.filter(
    (control) => control.status !== "available",
  ).length;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    stats: [
      {
        label: "Sources",
        value: String(input.snapshot.knowledge.sourceCount),
        tone:
          input.snapshot.knowledge.sourceCount > 0 ? "positive" : "critical",
      },
      {
        label: "Documents",
        value: String(input.snapshot.knowledge.documentCount),
        tone:
          input.snapshot.knowledge.documentCount > 0 ? "positive" : "critical",
      },
      {
        label: "Chunks",
        value: String(input.snapshot.knowledge.chunkCount),
        tone: input.snapshot.knowledge.chunkCount > 0 ? "positive" : "critical",
      },
      {
        label: "Modules ready",
        value: `${readyModules}/${input.snapshot.modules.length}`,
        tone: readinessTone(input.snapshot.status),
      },
      {
        label: "Control warnings",
        value: String(controlWarnings),
        tone: controlWarnings > 0 ? "attention" : "positive",
      },
    ],
  });
}

export function buildLynxModuleReadinessListSurface(input: {
  modules: readonly LynxModuleReadiness[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.modules;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "lynx",
      object: "lynx-readiness",
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, rows.length),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: "Lynx module readiness" },
      columnsId: "lynx-readiness-modules",
      rowKey: "moduleId",
      empty: {
        variant: "muted",
        title: "No accessible modules",
      },
    },
    columns: LYNX_READINESS_MODULE_COLUMNS,
    rows: rows.map((module) => ({
      id: module.moduleId,
      rowTone: rowToneForStatus(module.status),
      cells: {
        module: module.moduleLabel,
        status: module.status,
        records: signalValue(module, "records"),
        workItems: signalValue(module, "work-items"),
        documents: signalValue(module, "documents"),
        nextAction: module.safeNextAction,
      },
    })),
  });
}

export function buildLynxEnterpriseControlsListSurface(input: {
  controls: readonly LynxReadinessSignal[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.controls;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "lynx",
      object: "lynx-controls",
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, rows.length),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: "Enterprise controls" },
      columnsId: "lynx-enterprise-controls",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No enterprise controls configured",
      },
    },
    columns: LYNX_ENTERPRISE_CONTROL_COLUMNS,
    rows: rows.map((control) => ({
      id: control.id,
      rowTone: rowToneForStatus(control.status),
      cells: {
        control: control.label,
        status: control.status,
        value: control.value ?? "-",
        detail: control.detail,
      },
    })),
  });
}

export function buildLynxToolAvailabilityListSurface(input: {
  tools: readonly LynxToolAvailability[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.tools;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "lynx",
      object: "lynx-tools",
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, rows.length),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: "Lynx tool availability" },
      columnsId: "lynx-tool-availability",
      rowKey: "toolName",
      empty: {
        variant: "muted",
        title: "No Lynx tools are available",
      },
    },
    columns: LYNX_TOOL_AVAILABILITY_COLUMNS,
    rows: rows.map((tool) => ({
      id: tool.toolName,
      rowTone: rowToneForStatus(tool.status),
      cells: {
        tool: tool.toolName,
        status: tool.status,
        reason: tool.reason,
      },
    })),
  });
}

export function buildLynxActivityLedgerListSurface(input: {
  rows: readonly LynxActivityLedgerRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = [...input.rows];

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "lynx",
      object: "lynx-run-ledger",
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, rows.length),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: "Lynx run ledger" },
      columnsId: "lynx-activity-ledger",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No Lynx activity recorded yet",
      },
    },
    columns: LYNX_ACTIVITY_LEDGER_COLUMNS,
    rows: rows.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      ...(row.href ? { rowHref: row.href } : {}),
      cells: {
        label: row.label,
        kind: row.kind,
        status: row.status,
        module: row.moduleId,
        createdAt: row.createdAt,
        detail: row.detail,
      },
    })),
  });
}

export function buildLynxRunDetailStatGrid(input: {
  eventCount: number;
  toolCallCount: number;
  evidenceReferenceCount: number;
  feedbackCount: number;
  latencyMs: number;
  status: string;
}): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    stats: [
      {
        label: "Run status",
        value: input.status,
        tone: input.status === "failed" ? "critical" : "positive",
      },
      {
        label: "Events",
        value: String(input.eventCount),
        tone: input.eventCount > 0 ? "positive" : "attention",
      },
      {
        label: "Tool calls",
        value: String(input.toolCallCount),
        tone: input.toolCallCount > 0 ? "attention" : "default",
      },
      {
        label: "Evidence refs",
        value: String(input.evidenceReferenceCount),
        tone: input.evidenceReferenceCount > 0 ? "positive" : "default",
      },
      {
        label: "Feedback",
        value: String(input.feedbackCount),
        tone: input.feedbackCount > 0 ? "positive" : "default",
      },
      {
        label: "Latency",
        value: `${input.latencyMs} ms`,
        tone: input.latencyMs > 10_000 ? "attention" : "default",
      },
    ],
  });
}

export function buildLynxRunManagementStatGrid(input: {
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  startedRuns: number;
  averageLatencyMs: number;
  toolCallCount: number;
  evidenceReferenceCount: number;
  feedbackCount: number;
  negativeFeedbackCount: number;
}): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    stats: [
      {
        label: "Runs",
        value: String(input.totalRuns),
        tone: input.failedRuns > 0 ? "attention" : "positive",
      },
      {
        label: "Completed",
        value: String(input.completedRuns),
        tone: input.completedRuns > 0 ? "positive" : "default",
      },
      {
        label: "Failed",
        value: String(input.failedRuns),
        tone: input.failedRuns > 0 ? "critical" : "positive",
      },
      {
        label: "Tool calls",
        value: String(input.toolCallCount),
        tone: input.toolCallCount > 0 ? "attention" : "default",
      },
      {
        label: "Evidence refs",
        value: String(input.evidenceReferenceCount),
        tone: input.evidenceReferenceCount > 0 ? "positive" : "default",
      },
      {
        label: "Feedback",
        value: String(input.feedbackCount),
        tone: input.negativeFeedbackCount > 0 ? "attention" : "default",
      },
    ],
  });
}

export function buildLynxRunManagementQualityStatGrid(input: {
  startedRuns: number;
  averageLatencyMs: number;
  feedbackCount: number;
  negativeFeedbackCount: number;
  unsupportedClaimCount: number;
  failedQualityGateCount: number;
  lowCitationPrecisionCount: number;
}): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    stats: [
      {
        label: "Avg latency",
        value: `${input.averageLatencyMs} ms`,
        tone: input.averageLatencyMs > 10_000 ? "attention" : "default",
      },
      {
        label: "In progress",
        value: String(input.startedRuns),
        tone: input.startedRuns > 0 ? "attention" : "default",
      },
      {
        label: "Feedback",
        value: String(input.feedbackCount),
        tone: input.feedbackCount > 0 ? "positive" : "default",
      },
      {
        label: "Negative feedback",
        value: String(input.negativeFeedbackCount),
        tone: input.negativeFeedbackCount > 0 ? "critical" : "positive",
      },
      {
        label: "Unsupported claims",
        value: String(input.unsupportedClaimCount),
        tone: input.unsupportedClaimCount > 0 ? "critical" : "positive",
      },
      {
        label: "Failed gates",
        value: String(input.failedQualityGateCount),
        tone: input.failedQualityGateCount > 0 ? "critical" : "positive",
      },
      {
        label: "Low citations",
        value: String(input.lowCitationPrecisionCount),
        tone: input.lowCitationPrecisionCount > 0 ? "attention" : "positive",
      },
    ],
  });
}

export function buildLynxObservabilityStatGrid(input: {
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  failedQualityGateCount: number;
  unsupportedClaimCount: number;
  lowCitationPrecisionCount: number;
  proactiveWatchCount: number;
  proactiveBlockedCount: number;
  workflowSessionsCreated: number;
  workflowSessionsUpdated: number;
}): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    stats: [
      { label: "Runs", value: String(input.totalRuns), tone: "default" },
      {
        label: "Completed",
        value: String(input.completedRuns),
        tone: input.completedRuns > 0 ? "positive" : "default",
      },
      {
        label: "Failed",
        value: String(input.failedRuns),
        tone: input.failedRuns > 0 ? "critical" : "positive",
      },
      {
        label: "Failed gates",
        value: String(input.failedQualityGateCount),
        tone: input.failedQualityGateCount > 0 ? "critical" : "positive",
      },
      {
        label: "Unsupported",
        value: String(input.unsupportedClaimCount),
        tone: input.unsupportedClaimCount > 0 ? "critical" : "positive",
      },
      {
        label: "Low citations",
        value: String(input.lowCitationPrecisionCount),
        tone: input.lowCitationPrecisionCount > 0 ? "attention" : "positive",
      },
      {
        label: "Watch outcomes",
        value: String(input.proactiveWatchCount),
        tone: input.proactiveWatchCount > 0 ? "attention" : "default",
      },
      {
        label: "Blocked outcomes",
        value: String(input.proactiveBlockedCount),
        tone: input.proactiveBlockedCount > 0 ? "critical" : "positive",
      },
      {
        label: "Sessions created",
        value: String(input.workflowSessionsCreated),
        tone: input.workflowSessionsCreated > 0 ? "attention" : "default",
      },
      {
        label: "Sessions updated",
        value: String(input.workflowSessionsUpdated),
        tone: input.workflowSessionsUpdated > 0 ? "attention" : "default",
      },
    ],
  });
}

function buildLynxTableSurface(input: {
  title: string;
  columnsId: string;
  rows: ReadonlyArray<{
    id: string;
    rowTone?: ListSurfaceRowTone;
    cells: Record<string, string>;
    trailingAction?: ListSurfaceRow["trailingAction"];
  }>;
  columns: ReadonlyArray<ListColumn>;
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.rows.map((row) => ({ ...row, cells: { ...row.cells } }));
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "lynx",
      object: input.columnsId,
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, rows.length),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: input.title },
      columnsId: input.columnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: `No ${input.title.toLowerCase()} recorded`,
      },
    },
    columns: [...input.columns],
    rows,
  });
}

export function buildLynxLatencyAnalyticsListSurface(input: {
  rows: readonly LynxObservabilityLatencyRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLynxTableSurface({
    title: "Latency analytics",
    columnsId: "lynx-latency-analytics",
    columns: LYNX_OBSERVABILITY_LATENCY_COLUMNS,
    rows: input.rows.map((row) => ({ id: row.id, cells: { ...row } })),
  });
}

export function buildLynxQualityAnalyticsListSurface(input: {
  rows: readonly LynxObservabilityQualityRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLynxTableSurface({
    title: "Quality analytics",
    columnsId: "lynx-quality-analytics",
    columns: LYNX_OBSERVABILITY_QUALITY_COLUMNS,
    rows: input.rows.map((row) => ({
      id: row.id,
      rowTone:
        row.failedQualityGateCount !== "0" || row.unsupportedClaimCount !== "0"
          ? "critical"
          : "default",
      cells: { ...row },
    })),
  });
}

export function buildLynxProactiveOutcomeAnalyticsListSurface(input: {
  rows: readonly LynxProactiveOutcomeAnalyticsRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLynxTableSurface({
    title: "Proactive outcomes",
    columnsId: "lynx-proactive-outcomes",
    columns: LYNX_PROACTIVE_OUTCOME_COLUMNS,
    rows: input.rows.map((row) => ({
      id: row.id,
      rowTone:
        row.status === "blocked"
          ? "critical"
          : row.status === "watch"
            ? "attention"
            : "default",
      cells: { ...row },
    })),
  });
}

export function buildLynxOutcomeMonitorControlListSurface(input: {
  rows: readonly LynxOutcomeMonitorControlRow[];
  canMutate?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canMutate = input.canMutate ?? false;

  return buildLynxTableSurface({
    title: "Proactive monitor controls",
    columnsId: "lynx-monitor-controls",
    columns: LYNX_MONITOR_CONTROL_COLUMNS,
    rows: input.rows.map((row) => ({
      id: row.id,
      rowTone: row.enabled === "disabled" ? "attention" : "default",
      cells: { ...row },
      trailingAction: resolveListSurfaceRowTrailingAction({
        visible: true,
        allowed: canMutate,
        disabledReason: LYNX_MONITOR_CONFIGURE_APPROVE_REASON,
        descriptor: {
          id: `lynx.monitor.${row.monitorId}.configure`,
          label: "Configure monitor",
          intent: "default",
        },
      }),
    })),
  });
}

export function buildLynxSpendAnalyticsListSurface(input: {
  rows: readonly LynxSpendAnalyticsRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLynxTableSurface({
    title: "Spend analytics",
    columnsId: "lynx-spend-analytics",
    columns: LYNX_SPEND_ANALYTICS_COLUMNS,
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: { ...row },
    })),
  });
}

export function buildLynxRepresentativeEvalFailureListSurface(input: {
  rows: readonly LynxRepresentativeEvalFailureRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLynxTableSurface({
    title: "Representative eval failures",
    columnsId: "lynx-representative-eval-failures",
    columns: LYNX_REPRESENTATIVE_EVAL_FAILURE_COLUMNS,
    rows: input.rows.map((row) => ({
      id: row.id,
      rowTone: "critical",
      cells: { ...row },
    })),
  });
}

export function buildLynxRunManagementListSurface(input: {
  rows: readonly LynxRunManagementRow[];
  filters?: LynxRunManagementFilters;
  exportTriggerElementId?: string;
  pagination?: LynxRouteListPagination;
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.rows;
  const pagination = input.pagination ?? {
    pageSize: Math.max(1, rows.length),
    totalCount: rows.length,
    hasNextPage: false,
  };

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "lynx",
      object: "lynx-runs",
      function: "read",
    },
    pagination: {
      pageSize: pagination.pageSize,
      totalCount: pagination.totalCount,
      hasNextPage: pagination.hasNextPage,
    },
    presentation: {
      toolbar: {
        search: {
          param: "q",
          label: "Search",
          placeholder: "Search prompt summaries",
          value: input.filters?.search,
        },
        filters: [
          {
            id: "run-status",
            label: "Status",
            param: "status",
            value: input.filters?.status,
            options: [
              { label: "Started", value: "started" },
              { label: "Completed", value: "completed" },
              { label: "Failed", value: "failed" },
            ],
          },
          {
            id: "run-route",
            label: "Route",
            param: "route",
            value: input.filters?.route,
            options: [
              { label: "Operator", value: LYNX_ERP_HTTP_ROUTES.operator },
              {
                label: "Truth Retrieval",
                value: LYNX_ERP_HTTP_ROUTES.truthSearch,
              },
            ],
          },
          {
            id: "run-quality-gate",
            label: "Quality",
            param: "qualityGate",
            value: input.filters?.qualityGate,
            options: [
              { label: "Unsupported claims", value: "unsupported" },
              {
                label: "Low citation precision",
                value: "lowCitationPrecision",
              },
              { label: "Failed quality gate", value: "failedQualityGate" },
            ],
          },
          {
            id: "run-origin",
            label: "Origin",
            param: "origin",
            value: input.filters?.origin,
            options: [
              {
                label: "Proactive outcome sweep",
                value: "proactive-outcome-sweep",
              },
            ],
          },
          {
            id: "run-monitor-status",
            label: "Monitor",
            param: "monitorStatus",
            value: input.filters?.monitorStatus,
            options: [
              { label: "Healthy", value: "healthy" },
              { label: "Watch", value: "watch" },
              { label: "Blocked", value: "blocked" },
            ],
          },
          {
            id: "run-severity",
            label: "Severity",
            param: "severity",
            value: input.filters?.severity,
            options: [
              { label: "Info", value: "info" },
              { label: "Review", value: "review" },
              { label: "Critical", value: "critical" },
            ],
          },
        ],
        ...(input.exportTriggerElementId
          ? {
              export: {
                actionId: "lynx-runs-export",
                kind: "download",
                label: "Export CSV",
                formats: ["csv"],
                triggerElementId: input.exportTriggerElementId,
              },
            }
          : {}),
        resetParams: [
          "q",
          "status",
          "route",
          "workflowId",
          "model",
          "toolName",
          "qualityGate",
          "origin",
          "monitorStatus",
          "severity",
          "provider",
          "from",
          "to",
        ],
        columnPicker: true,
      },
    },
    surface: {
      header: { title: "Lynx runs" },
      columnsId: "lynx-run-management",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No Lynx runs match these filters",
      },
    },
    columns: LYNX_RUN_MANAGEMENT_COLUMNS,
    rows: rows.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      rowHref: row.href,
      cells: {
        promptSummary: row.promptSummary,
        route: row.route,
        workflowId: row.workflowId,
        model: row.model,
        qualityGate: row.qualityGate,
        unsupportedClaims: row.unsupportedClaims,
        status: row.status,
        latency: row.latency,
        startedAt: row.startedAt,
      },
    })),
  });
}

export function buildLynxWorkflowSessionListSurface(input: {
  rows: readonly LynxWorkflowSessionRow[];
  filters?: LynxWorkflowSessionFilters;
  pagination?: LynxRouteListPagination;
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.rows;
  const pagination = input.pagination ?? {
    pageSize: Math.max(1, rows.length),
    totalCount: rows.length,
    hasNextPage: false,
  };

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "lynx",
      object: "lynx-workflow-sessions",
      function: "read",
    },
    pagination: {
      pageSize: pagination.pageSize,
      totalCount: pagination.totalCount,
      hasNextPage: pagination.hasNextPage,
    },
    presentation: {
      toolbar: {
        filters: [
          {
            id: "workflow-session-status",
            label: "Status",
            param: "status",
            value: input.filters?.status,
            options: [
              { label: "Active", value: "active" },
              { label: "Paused", value: "paused" },
              { label: "Completed", value: "completed" },
              { label: "Failed", value: "failed" },
              { label: "Cancelled", value: "cancelled" },
            ],
          },
          {
            id: "workflow-session-origin",
            label: "Origin",
            param: "origin",
            value: input.filters?.origin,
            options: [
              {
                label: "Proactive outcome sweep",
                value: "proactive-outcome-sweep",
              },
            ],
          },
          {
            id: "workflow-session-monitor",
            label: "Monitor",
            param: "monitorStatus",
            value: input.filters?.monitorStatus,
            options: [
              { label: "Healthy", value: "healthy" },
              { label: "Watch", value: "watch" },
              { label: "Blocked", value: "blocked" },
            ],
          },
          {
            id: "workflow-session-severity",
            label: "Severity",
            param: "severity",
            value: input.filters?.severity,
            options: [
              { label: "Info", value: "info" },
              { label: "Review", value: "review" },
              { label: "Critical", value: "critical" },
            ],
          },
        ],
        resetParams: ["status", "origin", "monitorStatus", "severity"],
        columnPicker: true,
      },
    },
    surface: {
      header: { title: "Lynx workflow sessions" },
      columnsId: "lynx-workflow-sessions",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No workflow sessions recorded",
      },
    },
    columns: LYNX_WORKFLOW_SESSION_COLUMNS,
    rows: rows.map((row) => ({
      id: row.id,
      rowTone: rowToneForWorkflowSession(row),
      rowHref: row.href,
      cells: {
        promptSummary: row.promptSummary,
        workflowId: row.workflowId,
        origin: row.origin,
        monitorStatus: row.monitorStatus,
        severity: row.severity,
        ownerAuthUserId: row.ownerAuthUserId ?? "-",
        status: row.status,
        currentStage: row.currentStage,
        latestRunId: row.latestRunId,
        qualityGate: row.qualityGate,
        nextRecommendedStep: row.nextRecommendedStep,
        updatedAt: row.updatedAt,
      },
    })),
  });
}

export function buildLynxWorkflowSessionDetailStatGrid(input: {
  status: string;
  origin?: string;
  monitorStatus?: string;
  severity?: string;
  ownerAuthUserId?: string;
  currentStage: string;
  linkedRunCount: number;
  evidenceCount: number;
  approvalReferenceCount?: number;
  sandboxReferenceCount?: number;
  feedbackCount?: number;
  qualityGateStatus: string;
  updatedAt: string;
}): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    stats: [
      {
        label: "Session status",
        value: input.status,
        tone: input.status === "failed" ? "critical" : "positive",
      },
      {
        label: "Stage",
        value: input.currentStage,
        tone: input.currentStage.includes("failed") ? "attention" : "default",
      },
      {
        label: "Origin",
        value: input.origin ?? "-",
        tone:
          input.origin === "proactive-outcome-sweep" ? "attention" : "default",
      },
      {
        label: "Monitor",
        value: input.monitorStatus ?? "-",
        tone: input.monitorStatus === "blocked" ? "critical" : "default",
      },
      {
        label: "Severity",
        value: input.severity ?? "-",
        tone: input.severity === "critical" ? "critical" : "default",
      },
      {
        label: "Owner",
        value: input.ownerAuthUserId ?? "-",
        tone: input.ownerAuthUserId ? "attention" : "default",
      },
      {
        label: "Linked runs",
        value: String(input.linkedRunCount),
        tone: input.linkedRunCount > 0 ? "positive" : "attention",
      },
      {
        label: "Evidence refs",
        value: String(input.evidenceCount),
        tone: input.evidenceCount > 0 ? "positive" : "default",
      },
      {
        label: "Approvals",
        value: String(input.approvalReferenceCount ?? 0),
        tone: (input.approvalReferenceCount ?? 0) > 0 ? "attention" : "default",
      },
      {
        label: "Sandboxes",
        value: String(input.sandboxReferenceCount ?? 0),
        tone: (input.sandboxReferenceCount ?? 0) > 0 ? "attention" : "default",
      },
      {
        label: "Feedback",
        value: String(input.feedbackCount ?? 0),
        tone: (input.feedbackCount ?? 0) > 0 ? "positive" : "default",
      },
      {
        label: "Quality",
        value: input.qualityGateStatus,
        tone: input.qualityGateStatus === "failed" ? "critical" : "default",
      },
      {
        label: "Updated",
        value: input.updatedAt,
        tone: "default",
      },
    ],
  });
}

export function buildLynxWorkflowLinkedRunListSurface(input: {
  rows: readonly LynxRunManagementRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.rows;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "lynx",
      object: "lynx-workflow-runs",
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, rows.length),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: "Workflow runs" },
      columnsId: "lynx-workflow-linked-runs",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No runs linked to this workflow session",
      },
    },
    columns: LYNX_RUN_MANAGEMENT_COLUMNS,
    rows: rows.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      rowHref: row.href,
      cells: {
        promptSummary: row.promptSummary,
        route: row.route,
        workflowId: row.workflowId,
        model: row.model,
        qualityGate: row.qualityGate,
        unsupportedClaims: row.unsupportedClaims,
        status: row.status,
        latency: row.latency,
        startedAt: row.startedAt,
      },
    })),
  });
}

export function summarizeLynxQualityGateCell(
  gate: LynxQualityGateResult | null,
) {
  return gate?.status ?? "-";
}

export function buildLynxClaimValidationListSurface(input: {
  rows: readonly LynxClaimValidationRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.rows;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "lynx",
      object: "lynx-claim-validation",
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, rows.length),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: "Claim validation" },
      columnsId: "lynx-claim-validation",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No claim validation recorded",
      },
    },
    columns: LYNX_CLAIM_VALIDATION_COLUMNS,
    rows: rows.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        claim: row.claim,
        status: row.status,
        evidence: row.evidence,
        reason: row.reason,
      },
    })),
  });
}

export function buildLynxFailedEvalCaseListSurface(input: {
  rows: readonly LynxFailedEvalCaseRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.rows;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "lynx",
      object: "lynx-quality-failures",
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, rows.length),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: "Quality gate failures" },
      columnsId: "lynx-quality-gate-failures",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No failed quality gates recorded",
      },
    },
    columns: LYNX_FAILED_EVAL_CASE_COLUMNS,
    rows: rows.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      ...(row.href ? { rowHref: row.href } : {}),
      cells: {
        workflowId: row.workflowId,
        moduleId: row.moduleId,
        status: row.status,
        unsupportedClaims: row.unsupportedClaims,
        citationPrecision: row.citationPrecision,
        reason: row.reason,
      },
    })),
  });
}

export function buildLynxRunEventTimelineListSurface(input: {
  rows: readonly LynxRunEventTimelineRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.rows;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "lynx",
      object: "lynx-run-events",
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, rows.length),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: "Run replay timeline" },
      columnsId: "lynx-run-event-timeline",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No run events recorded",
      },
    },
    columns: LYNX_RUN_EVENT_TIMELINE_COLUMNS,
    rows: rows.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.eventType),
      cells: {
        eventType: row.eventType,
        toolName: row.toolName,
        evidenceCount: row.evidenceCount,
        validation: row.validation,
        approvalProposalId: row.approvalProposalId,
        sandboxId: row.sandboxId,
        createdAt: row.createdAt,
        summary: row.summary,
      },
    })),
  });
}

export function buildLynxRunFeedbackListSurface(input: {
  rows: readonly LynxRunFeedbackRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.rows;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "lynx",
      object: "lynx-run-feedback",
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, rows.length),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: "Operator feedback" },
      columnsId: "lynx-run-feedback",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No feedback recorded",
      },
    },
    columns: LYNX_RUN_FEEDBACK_COLUMNS,
    rows: rows.map((row) => ({
      id: row.id,
      rowTone: row.rating === "negative" ? "attention" : "default",
      cells: {
        rating: row.rating,
        category: row.category,
        note: row.note || "-",
        createdAt: row.createdAt,
      },
    })),
  });
}

export function getLynxReadinessSurfaceKeys() {
  return {
    stats: "lynx.readiness.stats",
    modules: "lynx.readiness.modules.list",
    controls: "lynx.enterprise-controls.list",
    tools: "lynx.tool-availability.list",
    activity: "lynx.run-ledger.list",
    management: "lynx.runs.management.list",
    managementStats: "lynx.runs.management.stats",
    qualityGateStats: "lynx.quality-gate.stats",
    workflowSessions: "lynx.workflow-sessions.list",
    workflowSessionStats: "lynx.workflow-session.stats",
    workflowSessionRuns: "lynx.workflow-session.runs.list",
    claims: "lynx.claim-validation.list",
    failedEvalCases: "lynx.quality-gate.failures.list",
    events: "lynx.run-events.list",
    feedback: "lynx.run-feedback.list",
    outcomeMonitors: lynxOutcomeMonitorControlSurfaceKey,
  } as const;
}
