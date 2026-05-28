import type {
  ListSurfaceRow,
  ListSurfaceRowTone,
} from "@afenda/governed-surface"
import type { ListCellKind } from "@afenda/governed-surface/schemas/list-surface.schema"

import {
  isLikelyHrmUuid,
  organizationHrmComplianceDetailPath,
  organizationHrmEmployeePath,
} from "../routing/constants"

export type HrmEmployeeListRowLinkFields = {
  rowHref: string
  linkColumnId: string
}

/** Per-cell employee link when a row has multiple link columns. */
export function hrmEmployeeLinkCellKind(
  orgSlug: string,
  employeeId: string
): Extract<ListCellKind, { kind: "link" }> {
  return {
    kind: "link",
    href: organizationHrmEmployeePath(orgSlug, employeeId),
  }
}

/** Canonical employee drill-down for governed list rows. */
export function hrmEmployeeListRowLinkFields(
  orgSlug: string,
  employeeId: string,
  linkColumnId: string
): HrmEmployeeListRowLinkFields {
  return {
    rowHref: organizationHrmEmployeePath(orgSlug, employeeId),
    linkColumnId,
  }
}

/** Prefer compliance evidence detail when id is UUID-shaped; else employee profile. */
export function hrmGovernedListRowLinkFields(input: {
  orgSlug: string
  linkColumnId: string
  employeeId?: string | null
  evidenceId?: string | null
}): Partial<HrmEmployeeListRowLinkFields> {
  const evidenceId = input.evidenceId?.trim()
  if (evidenceId && isLikelyHrmUuid(evidenceId)) {
    return {
      rowHref: organizationHrmComplianceDetailPath(input.orgSlug, evidenceId),
      linkColumnId: input.linkColumnId,
    }
  }

  const employeeId = input.employeeId?.trim()
  if (!employeeId) return {}

  return hrmEmployeeListRowLinkFields(
    input.orgSlug,
    employeeId,
    input.linkColumnId
  )
}

export type MapHrmEmployeeListRowInput = {
  orgSlug: string
  employeeId: string
  rowId: string
  linkColumnId: string
  cells: Record<string, string | number | boolean>
  rowTone?: ListSurfaceRowTone
  trailingAction?: ListSurfaceRow["trailingAction"]
  cellKinds?: ListSurfaceRow["cellKinds"]
}

export function mapHrmEmployeeListRow(
  input: MapHrmEmployeeListRowInput
): ListSurfaceRow {
  return {
    id: input.rowId,
    ...hrmEmployeeListRowLinkFields(
      input.orgSlug,
      input.employeeId,
      input.linkColumnId
    ),
    rowTone: input.rowTone,
    cells: input.cells,
    trailingAction: input.trailingAction,
    cellKinds: input.cellKinds,
  }
}
