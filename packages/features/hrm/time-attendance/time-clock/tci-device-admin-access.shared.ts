/**
 * HRM-TCI-027 — restrict device configuration and integration credentials to
 * authorized administrators (`hrm.time_clock_device.update`).
 *
 * `integrationCredentialRef` (vendor poll URLs, API ingest secrets) is writable only
 * through guarded device register/edit Server Actions — not via read-only list surfaces.
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import { TCI_DEVICE_RECORD_TABLE } from "./tci-device-registry.shared"

export const TCI_DEVICE_ADMIN_HRM_MODULE = "hrm" as const

export const TCI_DEVICE_ADMIN_PERMISSION = {
  module: TCI_DEVICE_ADMIN_HRM_MODULE,
  object: "time_clock_device",
  function: "update",
} as const

export const TCI_DEVICE_ADMIN_CREDENTIAL_COLUMN =
  "integrationCredentialRef" as const

export const TCI_DEVICE_ADMIN_UPSERT_ACTION_SYMBOL =
  "upsertTimeClockDeviceAction" as const

export const TCI_DEVICE_ADMIN_REVOKE_ACTION_SYMBOL =
  "revokeTimeClockDeviceAction" as const

export const TCI_DEVICE_ADMIN_UPSERT_COMMAND_SYMBOL =
  "upsertTimeClockDevice" as const

export const TCI_DEVICE_ADMIN_REVOKE_COMMAND_SYMBOL =
  "revokeTimeClockDevice" as const

export const TCI_DEVICE_ADMIN_ACCESS_RESOLVER_SYMBOL =
  "resolveTimeClockSurfaceAccess" as const

export const TCI_DEVICE_ADMIN_CAN_MANAGE_FLAG = "canManageDevices" as const

export type TciDeviceAdminAccessSurface =
  | {
      readonly door: "erp_rbac"
      readonly symbol: typeof TCI_DEVICE_ADMIN_PERMISSION.object
      readonly requirementCodes: readonly ["HRM-TCI-027"]
    }
  | {
      readonly door: "db"
      readonly symbol: typeof TCI_DEVICE_ADMIN_CREDENTIAL_COLUMN
      readonly requirementCodes: readonly ["HRM-TCI-004", "HRM-TCI-027"]
    }
  | {
      readonly door: "server_action"
      readonly symbol: typeof TCI_DEVICE_ADMIN_UPSERT_ACTION_SYMBOL
      readonly requirementCodes: readonly [
        "HRM-TCI-003",
        "HRM-TCI-004",
        "HRM-TCI-027",
      ]
    }
  | {
      readonly door: "server_action"
      readonly symbol: typeof TCI_DEVICE_ADMIN_REVOKE_ACTION_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-003", "HRM-TCI-027"]
    }
  | {
      readonly door: "pattern_c_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.devices
      readonly requirementCodes: readonly [
        "HRM-TCI-003",
        "HRM-TCI-004",
        "HRM-TCI-027",
      ]
    }
  | {
      readonly door: "ingest_auth"
      readonly symbol: "resolveTimeClockIngestActor"
      readonly requirementCodes: readonly ["HRM-TCI-010", "HRM-TCI-027"]
    }

export const TCI_DEVICE_ADMIN_ACCESS_SURFACES = [
  {
    door: "erp_rbac",
    symbol: TCI_DEVICE_ADMIN_PERMISSION.object,
    requirementCodes: ["HRM-TCI-027"],
  },
  {
    door: "db",
    symbol: TCI_DEVICE_ADMIN_CREDENTIAL_COLUMN,
    requirementCodes: ["HRM-TCI-004", "HRM-TCI-027"],
  },
  {
    door: "server_action",
    symbol: TCI_DEVICE_ADMIN_UPSERT_ACTION_SYMBOL,
    requirementCodes: ["HRM-TCI-003", "HRM-TCI-004", "HRM-TCI-027"],
  },
  {
    door: "server_action",
    symbol: TCI_DEVICE_ADMIN_REVOKE_ACTION_SYMBOL,
    requirementCodes: ["HRM-TCI-003", "HRM-TCI-027"],
  },
  {
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.devices,
    requirementCodes: ["HRM-TCI-003", "HRM-TCI-004", "HRM-TCI-027"],
  },
  {
    door: "ingest_auth",
    symbol: "resolveTimeClockIngestActor",
    requirementCodes: ["HRM-TCI-010", "HRM-TCI-027"],
  },
] as const satisfies readonly TciDeviceAdminAccessSurface[]

export function assertHrmTci027DeviceAdminAccessControl(): void {
  if (TCI_DEVICE_ADMIN_PERMISSION.function !== "update") {
    throw new Error("TCI device admin must gate on time_clock_device.update")
  }
  if (TCI_DEVICE_RECORD_TABLE !== "hrm_time_clock_device") {
    throw new Error("TCI device admin table must stay hrm_time_clock_device")
  }

  for (const surface of TCI_DEVICE_ADMIN_ACCESS_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-027")) {
      throw new Error(
        `TCI device admin surface "${surface.symbol}" must cite HRM-TCI-027`
      )
    }
  }

  if (TCI_DEVICE_ADMIN_CREDENTIAL_COLUMN !== "integrationCredentialRef") {
    throw new Error(
      "TCI credential column must remain integrationCredentialRef"
    )
  }
}
