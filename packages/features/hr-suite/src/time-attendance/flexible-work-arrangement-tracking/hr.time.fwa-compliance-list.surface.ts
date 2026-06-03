import type { HrFwaComplianceBreachRow } from "@afenda/db";

import { hrTimeFwaComplianceReadPermission } from "./hr.time.fwa.contract";
import { buildFwaListSearchToolbar, formatFwaEnumCell } from "./hr.time.fwa-list.shared";
import {
  hrFwaComplianceColumnsId,
  hrFwaComplianceSearchParam,
  hrFwaComplianceSurfaceKey,
} from "./hr.time.fwa-surface-metadata.shared";
import { hrFwaUiCopy } from "./hr.time.fwa-ui.copy.shared";
import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";

export {
  hrFwaComplianceSearchParam,
  hrFwaComplianceSurfaceKey,
};

export function buildHrFwaComplianceListSurface(input: {
  rows: readonly HrFwaComplianceBreachRow[];
  searchValue?: string;
}) {
  const copy = hrFwaUiCopy.compliance;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrTimeFwaComplianceReadPermission,
    presentation: {
      primaryColumnId: "kind",
      toolbar: buildFwaListSearchToolbar({
        param: hrFwaComplianceSearchParam,
        label: copy.searchLabel,
        placeholder: copy.searchPlaceholder,
        value: input.searchValue,
      }),
    },
    pagination: {
      pageSize: input.rows.length,
      totalCount: input.rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: copy.surfaceHeaderTitle },
      columnsId: hrFwaComplianceColumnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.emptyTitle,
        description: copy.emptyDescription,
      },
    },
    columns: [
      {
        id: "kind",
        header: copy.colKind,
        priority: "primary",
        wrap: true,
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "detected",
        header: copy.colDetected,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        kind: formatFwaEnumCell(row.breachKind),
        status: formatFwaEnumCell(row.status),
        detected: row.detectedAt.toISOString(),
      },
    })),
  });
}
