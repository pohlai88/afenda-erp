import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import { hrmEmployeeListRowLinkFields } from "../../../_core/shared"
import type { EmployeeRow } from "../../../_core/shared"

const EMPLOYEE_READ_PERMISSION = {
  module: "hrm" as const,
  object: "employee" as const,
  function: "read" as const,
}

type WorkforceListCopy = {
  empty: string
  colNumber: string
  colName: string
  colEmail: string
  colStatus: string
  statusActive: string
  statusArchived: string
}

export function buildWorkforceListSurfaceConfiguration(
  rows: readonly EmployeeRow[],
  orgSlug: string,
  copy: WorkforceListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: { tableDensity: "comfortable" },
    requiresErpPermission: EMPLOYEE_READ_PERMISSION,
    surface: {
      header: { title: "hrm-workforce" },
      columnsId: "hrm-workforce",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.empty,
      },
    },
    columns: [
      { id: "number", header: copy.colNumber },
      { id: "name", header: copy.colName },
      { id: "email", header: copy.colEmail },
      { id: "status", header: copy.colStatus },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.id, "number"),
      cells: {
        number: row.employeeNumber,
        name: row.preferredName
          ? `${row.legalName} (${row.preferredName})`
          : row.legalName,
        email: row.email ?? "—",
        status: row.archivedAt ? copy.statusArchived : copy.statusActive,
      },
    })),
  })
}
