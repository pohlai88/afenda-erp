import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

const LEAVE_READ_PERMISSION = {
  module: "hrm" as const,
  object: "leave" as const,
  function: "read" as const,
}

export type StatutoryHolidayListRow = {
  readonly id: string
  readonly date: string
  readonly name: string
}

type StatutoryHolidayListCopy = {
  empty: string
  colDate: string
  colName: string
}

export function buildStatutoryHolidayListSurfaceConfiguration(
  rows: readonly StatutoryHolidayListRow[],
  copy: StatutoryHolidayListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LEAVE_READ_PERMISSION,
    surface: {
      header: { title: "hrm-statutory-holidays" },
      columnsId: "hrm-statutory-holidays",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "date", header: copy.colDate },
      { id: "name", header: copy.colName },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        date: row.date,
        name: row.name,
      },
    })),
  })
}
