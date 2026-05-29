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

export type OrgHolidayListRow = {
  readonly id: string
  readonly holidayDate: string
  readonly name: string
  readonly regionCode: string | null
}

type OrgHolidayListCopy = {
  empty: string
  colDate: string
  colName: string
  colRegion: string
}

export function buildOrgHolidayListSurfaceConfiguration(
  rows: readonly OrgHolidayListRow[],
  copy: OrgHolidayListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LEAVE_READ_PERMISSION,
    surface: {
      header: { title: "hrm-org-holidays" },
      columnsId: "hrm-org-holidays",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "holidayDate", header: copy.colDate },
      { id: "name", header: copy.colName },
      { id: "region", header: copy.colRegion },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        holidayDate: row.holidayDate,
        name: row.name,
        region: row.regionCode ?? "—",
      },
    })),
  })
}
