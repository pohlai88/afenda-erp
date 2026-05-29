import "server-only"

import {
  buildGovernedListSurface,
  type BuildGovernedListSurfaceInput,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import type { ListPresentationProfileId } from "@afenda/governed-surface/schemas/presentation-profile.schema"
import type { ListCellTone } from "@afenda/governed-surface/schemas/list-surface.schema"
import { hrmEmployeeListRowLinkFields } from "@afenda/feature-hrm-core/shared"

export { TCI_STAT_SURFACE_KEY } from "../tci-surface-metadata.shared"

export const TCI_READ_PERMISSION = {
  module: "hrm" as const,
  object: "time_clock" as const,
  function: "read" as const,
}

export const TCI_AUDIT_PERMISSION = {
  module: "hrm" as const,
  object: "time_clock" as const,
  function: "audit" as const,
}

export type TciListSurfaceBuildInput = Omit<
  BuildGovernedListSurfaceInput,
  "presentationProfile"
> & {
  presentationProfile?: ListPresentationProfileId
}

/** Profile-first list surfaces — defaults to `erp-operational-table`. */
export function buildTciListSurface(
  input: TciListSurfaceBuildInput
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    ...input,
    presentationProfile: input.presentationProfile ?? "erp-operational-table",
  })
}

export function tciListHeader(columnsId: string) {
  return { title: columnsId }
}

export type TciEmployeeRowFields = {
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
}

export function formatTciEmployeeCell(row: TciEmployeeRowFields): string {
  const name = row.employeeLegalName ?? row.employeeId
  return row.employeeNumber != null ? `${name} · ${row.employeeNumber}` : name
}

export function tciEmployeeRowLinkFields(
  orgSlug: string | undefined,
  row: TciEmployeeRowFields
): { rowHref?: string; linkColumnId?: string } {
  if (!orgSlug) {
    return {}
  }
  return hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee")
}

export function toTciDateTimeCell(value: Date | null): string {
  return value != null ? value.toISOString() : "—"
}

export function syncStatusBadgeColumnTone(
  rows: readonly { readonly syncStatus: string }[]
): ListCellTone {
  if (rows.some((row) => row.syncStatus === "failed")) {
    return "critical"
  }
  if (rows.some((row) => row.syncStatus === "syncing")) {
    return "attention"
  }
  return "default"
}

export function deviceStateBadgeColumnTone(
  rows: readonly { readonly state: string }[]
): ListCellTone {
  if (rows.some((row) => row.state === "revoked" || row.state === "inactive")) {
    return "attention"
  }
  return "default"
}
