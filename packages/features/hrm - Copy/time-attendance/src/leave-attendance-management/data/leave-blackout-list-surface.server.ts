import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  listSurfaceRowTrailingActionHidden,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { LeaveBlackoutRow } from "./leave-blackout.queries.server"

const LEAVE_READ_PERMISSION = {
  module: "hrm" as const,
  object: "leave" as const,
  function: "read" as const,
}

type LeaveBlackoutListCopy = {
  empty: string
  colName: string
  colPeriod: string
  colLeaveType: string
  archiveLabel: string
}

export function buildLeaveBlackoutListSurfaceConfiguration(
  rows: readonly LeaveBlackoutRow[],
  copy: LeaveBlackoutListCopy,
  context: {
    canArchive: boolean
    leaveTypeLabel: (leaveTypeId: string | null) => string
  }
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LEAVE_READ_PERMISSION,
    surface: {
      header: { title: "hrm-leave-blackout" },
      columnsId: "hrm-leave-blackout",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "name", header: copy.colName },
      { id: "period", header: copy.colPeriod },
      { id: "leaveType", header: copy.colLeaveType },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        name: row.name,
        period: `${row.startDate} → ${row.endDate}`,
        leaveType: context.leaveTypeLabel(row.leaveTypeId),
      },
      trailingAction: context.canArchive
        ? resolveListSurfaceRowTrailingAction({
            allowed: true,
            descriptor: {
              id: "erp.hrm.leave_blackout.archive",
              label: copy.archiveLabel,
              intent: "destructive",
            },
          })
        : listSurfaceRowTrailingActionHidden(),
    })),
  })
}
