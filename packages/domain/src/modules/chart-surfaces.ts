import {
  buildGovernedChartSurface,
  type GovernedChartConfigurationInput,
} from "@afenda/governed-surface";

// ─── Dashboard hardening trend ────────────────────────────────────────────────

type HardeningChecklistItem = {
  area: string;
  status: string;
};

/**
 * Categorical bar chart summarising production hardening checklist status.
 * Used in the dashboard to give operators a quick readiness read.
 */
export function buildDashboardHardeningChart(input: {
  checklist: readonly HardeningChecklistItem[];
}): GovernedChartConfigurationInput {
  const reviewed = input.checklist.filter((i) => i.status !== "review").length;
  const pending = input.checklist.filter((i) => i.status === "review").length;

  return buildGovernedChartSurface({
    presentationProfile: "erp-status-chart",
    title: "Hardening status",
    series: [
      {
        id: "hardening-status",
        label: "Checklist items",
        points: [
          { x: "Reviewed", y: reviewed },
          { x: "Pending", y: pending },
        ],
      },
    ],
    empty: {
      variant: "muted",
      title: "No hardening checklist data available.",
    },
  });
}

// ─── Module observability sparkline ──────────────────────────────────────────

type ObservabilityIndicator = {
  label: string;
  value: number;
  category?: string;
};

/**
 * Categorical bar chart of observability indicator values for a module.
 * Provides a lightweight coverage view alongside the indicator list.
 */
export function buildModuleObservabilityChart(input: {
  indicators: readonly ObservabilityIndicator[];
  moduleId: string;
}): GovernedChartConfigurationInput {
  const points = input.indicators
    .filter((i) => typeof i.value === "number")
    .slice(0, 8)
    .map((indicator) => ({
      x: indicator.label,
      y: indicator.value,
    }));

  return buildGovernedChartSurface({
    presentationProfile: "erp-status-chart",
    title: `${input.moduleId} observability`,
    series:
      points.length > 0
        ? [{ id: "observability", label: "Indicators", points }]
        : undefined,
    empty: {
      variant: "muted",
      title: "No observability data available.",
    },
  });
}

// ─── Surface keys ─────────────────────────────────────────────────────────────

export const dashboardHardeningChartSurfaceKey =
  "dashboard.hardening.chart" as const;

export function getModuleObservabilityChartSurfaceKey(moduleId: string) {
  return `${moduleId}.observability.chart` as const;
}
