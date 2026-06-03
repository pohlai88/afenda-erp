import type { ModuleId } from "@afenda/config/module-ids";
import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

// Internal metric tone mapping (domain → stat-card token).
type ModuleTone = "neutral" | "positive" | "warning";
type StatTone = "default" | "positive" | "attention" | "critical";

function toStatCardTone(tone: ModuleTone | string): StatTone {
  if (tone === "positive") return "positive";
  if (tone === "warning") return "attention";
  return "default";
}

export type ResolvedMetric = {
  label: string;
  value: string;
  detail: string;
  tone: string;
};

/**
 * Maps resolved module metrics to a governed KPI stat grid.
 */
export function buildModuleWorkspaceStatGrid(input: {
  moduleId: ModuleId;
  metrics: readonly ResolvedMetric[];
}): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "kpi",
    presentationProfile: "erp-kpi-grid",
    stats: input.metrics.map((metric) => ({
      label: metric.label,
      value: metric.value,
      tone: toStatCardTone(metric.tone),
      delta: metric.detail || undefined,
      animateValue: false,
    })),
  });
}

/**
 * Maps raw workspace counts to a governed operation-summary stat grid.
 */
export function buildModuleWorkspaceCountStatGrid(input: {
  moduleId: ModuleId;
  recordCount: number;
  workItemCount: number;
  documentCount: number;
  highPriorityWorkItemCount: number;
}): StatCardConfigurationResolvedInput {
  const { recordCount, workItemCount, documentCount, highPriorityWorkItemCount } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "kpi",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: "Tenant records",
        value: String(recordCount),
        tone: recordCount > 0 ? "positive" : "default",
      },
      {
        label: "Workflow items",
        value: String(workItemCount),
        tone: highPriorityWorkItemCount > 0 ? "attention" : "positive",
      },
      {
        label: "Documents",
        value: String(documentCount),
        tone: documentCount > 0 ? "positive" : "default",
      },
    ],
  });
}

/**
 * Builds the dashboard KPI stat grid from resolved organization-level metrics.
 */
export function buildDashboardKpiStatGrid(input: {
  metrics: readonly ResolvedMetric[];
}): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "kpi",
    presentationProfile: "erp-kpi-grid",
    stats: input.metrics.map((metric) => ({
      label: metric.label,
      value: metric.value,
      tone: toStatCardTone(metric.tone),
      delta: metric.detail || undefined,
      animateValue: false,
    })),
  });
}

export function getModuleStatSurfaceKey(moduleId: ModuleId) {
  return `${moduleId}-kpi-stats`;
}

export function getModuleOverviewStatSurfaceKey(moduleId: ModuleId) {
  return `${moduleId}-overview-stats`;
}

/**
 * Snapshot stat grid for module header metadata (route, views, data source, milestones).
 */
export function buildModuleScreenOverviewStatGrid(input: {
  moduleId: ModuleId;
  stats: readonly { label: string; value: string }[];
}): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: input.stats.map((stat) => ({
      label: stat.label,
      value: stat.value,
      tone: "default" as const,
    })),
  });
}

/**
 * Workflow queue summary counts for the dashboard automation panel.
 */
export function buildDashboardWorkflowSummaryStatGrid(input: {
  queueDepth: number;
  escalations: number;
  highPriority: number;
}): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "kpi",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: "Queue depth",
        value: String(input.queueDepth),
        tone: input.queueDepth > 0 ? "attention" : "default",
      },
      {
        label: "Escalations",
        value: String(input.escalations),
        tone: input.escalations > 0 ? "attention" : "positive",
      },
      {
        label: "High priority",
        value: String(input.highPriority),
        tone: input.highPriority > 0 ? "attention" : "positive",
      },
    ],
  });
}

export const dashboardStatSurfaceKey = "dashboard-kpi-stats";
export const dashboardWorkflowSummaryStatSurfaceKey =
  "dashboard-workflow-summary-stats";
