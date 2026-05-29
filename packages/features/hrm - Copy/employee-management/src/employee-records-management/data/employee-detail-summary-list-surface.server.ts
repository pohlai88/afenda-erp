import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

const EMPLOYEE_READ_PERMISSION = {
  module: "hrm" as const,
  object: "employee" as const,
  function: "read" as const,
}

export type EmployeeDetailSummaryRow = {
  id: string
  field: string
  value: string
}

type EmployeeDetailSummaryListCopy = {
  empty: string
  colField: string
  colValue: string
}

export function buildEmployeeDetailSummaryListSurfaceConfiguration(
  rows: readonly EmployeeDetailSummaryRow[],
  copy: EmployeeDetailSummaryListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "document-lines",
    presentationProfile: "erp-analytical-table",
    requiresErpPermission: EMPLOYEE_READ_PERMISSION,
    presentation: {
      primaryColumnId: "field",
      narrowMode: "auto",
    },
    surface: {
      header: { title: "hrm-employee-detail-summary" },
      columnsId: "hrm-employee-detail-summary",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "field",
        header: copy.colField,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 160,
      },
      { id: "value", header: copy.colValue, wrap: true },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        field: row.field,
        value: row.value,
      },
    })),
  })
}
