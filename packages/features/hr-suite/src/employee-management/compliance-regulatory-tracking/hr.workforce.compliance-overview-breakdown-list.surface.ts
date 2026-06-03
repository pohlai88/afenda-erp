import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrComplianceOverviewSnapshot } from "@afenda/db";

import { hrWorkforceComplianceReadPermission } from "./hr.workforce.compliance.contract";
import { hrComplianceOverviewBreakdownColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceOverviewBreakdownSurfaceKey =
  "hr.workforce.compliance.overview-breakdown.list";

function formatOverviewDimensionLabel(
  dimension: HrComplianceOverviewSnapshot["dimensionBreakdown"][number]["dimension"],
): string {
  switch (dimension) {
    case "department":
      return "Department";
    case "legal_entity":
      return "Legal entity";
    case "work_location":
      return "Work location";
    case "worker_category":
      return "Worker category";
    default: {
      const exhaustive: never = dimension;
      return exhaustive;
    }
  }
}

export function buildHrComplianceOverviewBreakdownListSurface(input: {
  snapshot: HrComplianceOverviewSnapshot;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrComplianceUiCopy.overviewBreakdown;
  const rows = input.snapshot.dimensionBreakdown;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrWorkforceComplianceReadPermission,
    presentation: {
      primaryColumnId: "dimensionValue",
    },
    pagination: {
      pageSize: Math.max(rows.length, 1),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: copy.surfaceHeaderTitle },
      columnsId: hrComplianceOverviewBreakdownColumnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.emptyTitle,
        description: copy.emptyDescription,
      },
    },
    columns: [
      {
        id: "dimension",
        header: copy.colDimension,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "dimensionValue",
        header: copy.colDimensionValue,
        priority: "primary",
        minWidth: 180,
      },
      {
        id: "trackedCount",
        header: copy.colTracked,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "atRiskCount",
        header: copy.colAtRisk,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "overdueCount",
        header: copy.colOverdue,
        cellKind: { kind: "badge", tone: "critical" },
      },
      {
        id: "openExceptionCount",
        header: copy.colOpenExceptions,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        dimension: formatOverviewDimensionLabel(row.dimension),
        dimensionValue: row.dimensionValue,
        trackedCount: row.trackedCount.toLocaleString("en-US"),
        atRiskCount: row.atRiskCount.toLocaleString("en-US"),
        overdueCount: row.overdueCount.toLocaleString("en-US"),
        openExceptionCount: row.openExceptionCount.toLocaleString("en-US"),
      },
      cellKinds: {
        atRiskCount: {
          kind: "badge",
          tone: row.atRiskCount > 0 ? "attention" : "default",
        },
        overdueCount: {
          kind: "badge",
          tone: row.overdueCount > 0 ? "critical" : "default",
        },
        openExceptionCount: {
          kind: "badge",
          tone: row.openExceptionCount > 0 ? "attention" : "default",
        },
      },
    })),
  });
}
