import type {
  GovernedChartPresentationProfiles,
  GovernedListPresentationProfiles,
  GovernedStatPresentationProfiles,
} from "./gov-governed-profile-types";

const ERP_TABLE_BASE = {
  variant: "table-only" as const,
  tableDensity: "compact" as const,
  stickyHeader: true,
  virtualizeRowThreshold: 100,
  toolbar: {
    columnPicker: true,
    densityToggle: true,
  },
};

const ERP_ANALYTICAL_TABLE = {
  ...ERP_TABLE_BASE,
  narrowMode: "auto" as const,
  selection: {
    mode: "multiple" as const,
    label: "Select rows",
    bulkScopeLabel: "selected rows",
  },
  decisionLedger: {
    enabled: true,
    label: "Decision ledger",
  },
};

/**
 * Canonical ERP list presentation defaults (v1).
 * Builders supply row truth and optional `presentation` overrides (e.g. export toolbar).
 */
export const GOVERNED_LIST_PRESENTATION_PROFILES: GovernedListPresentationProfiles =
  {
    /** Standard read-only directories — compact table chrome. */
    "erp-operational-table": ERP_TABLE_BASE,
    /**
     * Exception / inbox / queue lists — responsive card fallback on narrow containers;
     * builders attach `presentation.toolbar` (export, focus search) when needed.
     */
    "erp-exception-table": {
      ...ERP_TABLE_BASE,
      narrowMode: "auto",
    },
    /**
     * Dense comparison surfaces — SAP-style analytical table chrome plus
     * Afenda Decision Ledger affordance. Builders still own group/summary truth.
     */
    "erp-analytical-table": ERP_ANALYTICAL_TABLE,
    /** Audit / history / traceability — pair with `dataNature: "document-lines"` on the builder. */
    "erp-audit-ledger": ERP_TABLE_BASE,
  };

/**
 * Canonical ERP stat-card presentation defaults (v1).
 * Builders still set `dataNature`, stats, href, comparison, sparkPoints.
 */
export const GOVERNED_STAT_PRESENTATION_PROFILES: GovernedStatPresentationProfiles =
  {
    "erp-kpi-grid": {
      density: "compact",
    },
    "erp-executive-summary": {
      density: "comfortable",
    },
  };

/**
 * Canonical ERP chart presentation defaults (v1).
 * Builders still supply `series`, `heatmap`, `annotations`, and `title`.
 */
export const GOVERNED_CHART_PRESENTATION_PROFILES: GovernedChartPresentationProfiles =
  {
    /** Time-series area/line charts for KPI trends and operational timelines. */
    "erp-trend-chart": {
      chartKind: "area",
      dataNature: "time-series",
    },
    /** Categorical bar charts for status distributions and count comparisons. */
    "erp-status-chart": {
      chartKind: "bar",
      dataNature: "categorical",
    },
  };
