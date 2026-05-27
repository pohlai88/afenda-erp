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
 * Maps resolved module metrics (from definitions or DB) to a governed KPI stat grid.
 * Used for module workspace headline metrics that previously used MetricGrid.
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
      // Map detail text to comparison label for contextual info display
      comparison: metric.detail
        ? {
            priorValue: metric.value,
            label: metric.detail,
            direction: "flat" as const,
          }
        : undefined,
    })),
  });
}

/**
 * Maps raw workspace counts to a governed operation-summary stat grid.
 * Replaces the three individual MetricCard components in module-screen.tsx.
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
 * Replaces the MetricCard trio and MetricGrid in dashboard-route.tsx.
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
      comparison: metric.detail
        ? {
            priorValue: metric.value,
            label: metric.detail,
            direction: "flat" as const,
          }
        : undefined,
    })),
  });
}

/**
 * Builds the solution console capability stat grid.
 * Replaces MetricCard usage in solution-console-route.tsx.
 */
export function buildSolutionConsoleStatGrid(input: {
  metrics: readonly ResolvedMetric[];
}): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    stats: input.metrics.map((metric) => ({
      label: metric.label,
      value: metric.value,
      tone: toStatCardTone(metric.tone),
    })),
  });
}

export function getModuleStatSurfaceKey(moduleId: ModuleId) {
  return `${moduleId}-kpi-stats`;
}

export const dashboardStatSurfaceKey = "dashboard-kpi-stats";
export const solutionConsoleStatSurfaceKey = "solution-console-exec-stats";
