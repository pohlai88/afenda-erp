import "server-only"

import {
  GOVERNED_METADATA_SCHEMA_VERSION,
  listSurfaceRowTrailingActionHidden,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import { TCI_LIST_SURFACE_IDS } from "../tci-surface-metadata.shared"
import {
  deviceStateBadgeColumnTone,
  formatTciEmployeeCell,
  syncStatusBadgeColumnTone,
  buildTciListSurface,
  TCI_READ_PERMISSION,
  tciEmployeeRowLinkFields,
  tciListHeader,
  toTciDateTimeCell,
} from "./_shared.server"
import type {
  TimeClockDeviceRow,
  TimeClockMappingRow,
} from "../tci.queries.server"

export function buildTimeClockDevicesListSurfaceConfiguration(
  rows: readonly TimeClockDeviceRow[],
  copy: {
    empty: string
    colDeviceId: string
    colName: string
    colType: string
    colLocation: string
    colStatus: string
    colSync: string
    colLastSync: string
    formatDeviceType: (deviceType: string) => string
    formatDeviceState: (state: string) => string
    formatSyncStatus: (syncStatus: string) => string
    manageActionsLabel: string
  },
  options: { canManage: boolean }
): ListSurfaceRendererConfigurationInput {
  const syncColumnTone = syncStatusBadgeColumnTone(rows)
  const stateColumnTone = deviceStateBadgeColumnTone(rows)
  const columnsId = TCI_LIST_SURFACE_IDS.devices
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "deviceId", header: copy.colDeviceId },
      { id: "name", header: copy.colName },
      {
        id: "type",
        header: copy.colType,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "location", header: copy.colLocation },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: {
          kind: "badge",
          tone: stateColumnTone,
        },
      },
      {
        id: "sync",
        header: copy.colSync,
        cellKind: {
          kind: "badge",
          tone: syncColumnTone,
        },
      },
      {
        id: "lastSync",
        header: copy.colLastSync,
        cellKind: { kind: "datetime" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        deviceId: row.externalDeviceId,
        name: row.name,
        type: copy.formatDeviceType(row.deviceType),
        location: row.locationRef ?? "—",
        status: copy.formatDeviceState(row.state),
        sync: copy.formatSyncStatus(row.syncStatus),
        lastSync: toTciDateTimeCell(row.lastSyncAt),
      },
      trailingAction:
        options.canManage && row.state !== "revoked"
          ? resolveListSurfaceRowTrailingAction({
              allowed: true,
              descriptor: {
                id: "erp.hrm.time_clock.device.manage",
                label: copy.manageActionsLabel,
                intent: "default",
              },
            })
          : listSurfaceRowTrailingActionHidden(),
    })),
  })
}

export function buildTimeClockMappingsListSurfaceConfiguration(
  rows: readonly TimeClockMappingRow[],
  copy: {
    empty: string
    colEmployee: string
    colDevice: string
    colClockUser: string
    colBadge: string
    colBiometric: string
    colStatus: string
    formatMappingState: (state: string) => string
  },
  options?: { orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.mappings
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        cellKind: options?.orgSlug ? { kind: "link" } : undefined,
      },
      { id: "device", header: copy.colDevice },
      { id: "clockUser", header: copy.colClockUser },
      { id: "badge", header: copy.colBadge },
      { id: "biometric", header: copy.colBiometric },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatTciEmployeeCell(row),
        device: row.deviceName,
        clockUser: row.clockUserId ?? "—",
        badge: row.badgeId ?? "—",
        biometric: row.biometricRef ?? "—",
        status: copy.formatMappingState(row.state),
      },
      ...tciEmployeeRowLinkFields(options?.orgSlug, row),
      trailingAction: listSurfaceRowTrailingActionHidden(),
    })),
  })
}
