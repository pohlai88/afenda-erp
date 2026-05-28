/**
 * HRM-TCI-003 — org-scoped time clock device records (`hrm_time_clock_device`).
 */

export const TCI_DEVICE_RECORD_TABLE = "hrm_time_clock_device" as const

export const TCI_DEVICE_RECORD_MAINTENANCE_OPERATIONS = [
  "list",
  "create",
  "update",
  "revoke",
] as const

export type TciDeviceRecordMaintenanceOperation =
  (typeof TCI_DEVICE_RECORD_MAINTENANCE_OPERATIONS)[number]

export type TciDeviceRecordMaintenanceSurface = {
  readonly operation: TciDeviceRecordMaintenanceOperation
  readonly door: "query" | "server_action" | "pattern_c_ui"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_DEVICE_RECORD_MAINTENANCE_SURFACES = [
  {
    operation: "list",
    door: "query",
    symbol: "listTimeClockDevicesForOrg",
    requirementCodes: ["HRM-TCI-003", "HRM-TCI-004"],
  },
  {
    operation: "create",
    door: "server_action",
    symbol: "upsertTimeClockDeviceAction",
    requirementCodes: ["HRM-TCI-003", "HRM-TCI-027"],
  },
  {
    operation: "update",
    door: "server_action",
    symbol: "upsertTimeClockDeviceAction",
    requirementCodes: ["HRM-TCI-003", "HRM-TCI-004", "HRM-TCI-027"],
  },
  {
    operation: "revoke",
    door: "server_action",
    symbol: "revokeTimeClockDeviceAction",
    requirementCodes: ["HRM-TCI-003", "HRM-TCI-027"],
  },
  {
    operation: "list",
    door: "pattern_c_ui",
    symbol: "hrm:time-clock:devices",
    requirementCodes: ["HRM-TCI-003", "HRM-TCI-004"],
  },
] as const satisfies readonly TciDeviceRecordMaintenanceSurface[]

export function assertHrmTci003DeviceRecordMaintenance(): void {
  const ops = new Set(TCI_DEVICE_RECORD_MAINTENANCE_OPERATIONS)
  for (const surface of TCI_DEVICE_RECORD_MAINTENANCE_SURFACES) {
    if (!ops.has(surface.operation)) {
      throw new Error(
        `TCI device maintenance surface references unknown operation "${surface.operation}"`
      )
    }
    if (!surface.requirementCodes.includes("HRM-TCI-003")) {
      throw new Error(
        `TCI device maintenance surface "${surface.symbol}" must cite HRM-TCI-003`
      )
    }
  }
  for (const required of TCI_DEVICE_RECORD_MAINTENANCE_OPERATIONS) {
    if (
      !TCI_DEVICE_RECORD_MAINTENANCE_SURFACES.some(
        (s) => s.operation === required
      )
    ) {
      throw new Error(
        `HRM-TCI-003 missing maintenance surface for "${required}"`
      )
    }
  }
}
