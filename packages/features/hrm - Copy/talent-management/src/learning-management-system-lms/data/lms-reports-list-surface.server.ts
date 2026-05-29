import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import {
  LMS_REPORTS_LIST_COLUMNS_ID,
  lmsListHeader,
} from "../lms-list-surface.shared"

const LMS_AUDIT_PERMISSION = {
  module: "hrm" as const,
  object: "lms" as const,
  function: "audit" as const,
}

export type LmsReportCatalogRow = {
  readonly id: string
  readonly reportKey: string
  readonly label: string
  readonly description: string
}

export type LmsReportsListCopy = {
  empty: string
  colReport: string
  colDescription: string
}

export function buildLmsReportsListSurfaceConfiguration(
  rows: readonly LmsReportCatalogRow[],
  copy: LmsReportsListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LMS_AUDIT_PERMISSION,
    surface: {
      header: lmsListHeader(LMS_REPORTS_LIST_COLUMNS_ID),
      columnsId: LMS_REPORTS_LIST_COLUMNS_ID,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "report", header: copy.colReport },
      { id: "description", header: copy.colDescription },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        report: row.label,
        description: row.description,
      },
      trailingAction: { state: "hidden" as const },
    })),
  })
}
