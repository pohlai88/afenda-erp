/**
 * HRM-TCI-004 — device metadata captured on `hrm_time_clock_device` and Pattern C list.
 *
 * Requirement "device ID" = vendor `externalDeviceId` (ingest key). Afenda row `id` is the
 * stable list row key only (edit/revoke), not shown as a separate column.
 *
 * Requirement "status" = registry lifecycle (`state`). `syncStatus` is operational sync health
 * (complementary; surfaced beside status for administrators).
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import { TCI_DEVICE_RECORD_TABLE } from "./tci-device-registry.shared"

export const TCI_HRM_TCI_004_METADATA_FIELDS = [
  "deviceId",
  "deviceName",
  "deviceType",
  "location",
  "status",
  "syncStatus",
  "lastSyncTimestamp",
] as const

export type TciHrmTci004MetadataField =
  (typeof TCI_HRM_TCI_004_METADATA_FIELDS)[number]

export type TciDeviceMetadataFieldBinding = {
  readonly field: TciHrmTci004MetadataField
  readonly dbColumn: string
  readonly listColumnId: string
  readonly i18nColumnKey: string
}

export const TCI_DEVICE_METADATA_FIELD_BINDINGS = [
  {
    field: "deviceId",
    dbColumn: "external_device_id",
    listColumnId: "deviceId",
    i18nColumnKey: "colDeviceId",
  },
  {
    field: "deviceName",
    dbColumn: "name",
    listColumnId: "name",
    i18nColumnKey: "colName",
  },
  {
    field: "deviceType",
    dbColumn: "device_type",
    listColumnId: "type",
    i18nColumnKey: "colType",
  },
  {
    field: "location",
    dbColumn: "location_ref",
    listColumnId: "location",
    i18nColumnKey: "colLocation",
  },
  {
    field: "status",
    dbColumn: "state",
    listColumnId: "status",
    i18nColumnKey: "colStatus",
  },
  {
    field: "syncStatus",
    dbColumn: "sync_status",
    listColumnId: "sync",
    i18nColumnKey: "colSync",
  },
  {
    field: "lastSyncTimestamp",
    dbColumn: "last_sync_at",
    listColumnId: "lastSync",
    i18nColumnKey: "colLastSync",
  },
] as const satisfies readonly TciDeviceMetadataFieldBinding[]

export type TciDeviceMetadataCaptureSurface = {
  readonly door: "db" | "query" | "pattern_c_list" | "last_sync_writer"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_DEVICE_METADATA_CAPTURE_SURFACES = [
  {
    door: "db",
    symbol: TCI_DEVICE_RECORD_TABLE,
    requirementCodes: ["HRM-TCI-004"],
  },
  {
    door: "query",
    symbol: "listTimeClockDevicesForOrg",
    requirementCodes: ["HRM-TCI-003", "HRM-TCI-004"],
  },
  {
    door: "pattern_c_list",
    symbol: TCI_LIST_SURFACE_IDS.devices,
    requirementCodes: ["HRM-TCI-003", "HRM-TCI-004"],
  },
  {
    door: "last_sync_writer",
    symbol: "persistTimeClockPunch",
    requirementCodes: ["HRM-TCI-004", "HRM-TCI-008"],
  },
  {
    door: "last_sync_writer",
    symbol: "runTimeClockScheduledSyncTick",
    requirementCodes: ["HRM-TCI-004", "HRM-TCI-011"],
  },
] as const satisfies readonly TciDeviceMetadataCaptureSurface[]

export function assertHrmTci004DeviceMetadataCapture(): void {
  const fields = new Set(TCI_HRM_TCI_004_METADATA_FIELDS)
  if (TCI_DEVICE_METADATA_FIELD_BINDINGS.length !== fields.size) {
    throw new Error(
      "HRM-TCI-004 metadata bindings must cover every declared field"
    )
  }
  for (const binding of TCI_DEVICE_METADATA_FIELD_BINDINGS) {
    if (!fields.has(binding.field)) {
      throw new Error(
        `HRM-TCI-004 binding references unknown field "${binding.field}"`
      )
    }
  }
  for (const surface of TCI_DEVICE_METADATA_CAPTURE_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-004")) {
      throw new Error(
        `TCI device metadata surface "${surface.symbol}" must cite HRM-TCI-004`
      )
    }
  }
  const requiredColumns = new Set(
    TCI_DEVICE_METADATA_FIELD_BINDINGS.map((b) => b.listColumnId)
  )
  for (const required of [
    "deviceId",
    "name",
    "type",
    "location",
    "status",
    "sync",
    "lastSync",
  ] as const) {
    if (!requiredColumns.has(required)) {
      throw new Error(
        `HRM-TCI-004 missing list column binding for "${required}"`
      )
    }
  }
}
