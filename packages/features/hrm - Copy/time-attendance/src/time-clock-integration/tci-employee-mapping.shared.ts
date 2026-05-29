/**
 * HRM-TCI-005 — terminal identity ↔ employee mapping (`hrm_time_clock_employee_mapping`).
 *
 * Ingest resolution keys punches by `(organization, device, clockUserId)` — the clock / device
 * user ID sent by the terminal. `badgeId` and `biometricRef` are captured for operator truth
 * and cross-reference; they do not replace `clockUserId` on the ingest path (HRM-TCI-015).
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"

export const TCI_EMPLOYEE_MAPPING_TABLE =
  "hrm_time_clock_employee_mapping" as const

export const TCI_HRM_TCI_005_IDENTITY_FIELDS = [
  "clockUserId",
  "badgeId",
  "biometricRef",
] as const

export type TciHrmTci005IdentityField =
  (typeof TCI_HRM_TCI_005_IDENTITY_FIELDS)[number]

export type TciEmployeeMappingFieldBinding = {
  readonly field:
    | TciHrmTci005IdentityField
    | "employeeRecord"
    | "terminalScope"
    | "mappingStatus"
  readonly dbColumn: string
  readonly listColumnId: string
  readonly i18nColumnKey: string
}

export const TCI_EMPLOYEE_MAPPING_FIELD_BINDINGS = [
  {
    field: "employeeRecord",
    dbColumn: "employee_id",
    listColumnId: "employee",
    i18nColumnKey: "colEmployee",
  },
  {
    field: "terminalScope",
    dbColumn: "device_id",
    listColumnId: "device",
    i18nColumnKey: "colDevice",
  },
  {
    field: "clockUserId",
    dbColumn: "clock_user_id",
    listColumnId: "clockUser",
    i18nColumnKey: "colClockUser",
  },
  {
    field: "badgeId",
    dbColumn: "badge_id",
    listColumnId: "badge",
    i18nColumnKey: "colBadge",
  },
  {
    field: "biometricRef",
    dbColumn: "biometric_ref",
    listColumnId: "biometric",
    i18nColumnKey: "colBiometric",
  },
  {
    field: "mappingStatus",
    dbColumn: "state",
    listColumnId: "status",
    i18nColumnKey: "colStatus",
  },
] as const satisfies readonly TciEmployeeMappingFieldBinding[]

export const TCI_EMPLOYEE_MAPPING_MAINTENANCE_OPERATIONS = [
  "list",
  "create",
  "update",
] as const

export type TciEmployeeMappingMaintenanceOperation =
  (typeof TCI_EMPLOYEE_MAPPING_MAINTENANCE_OPERATIONS)[number]

export type TciEmployeeMappingMaintenanceSurface = {
  readonly operation: TciEmployeeMappingMaintenanceOperation
  readonly door:
    | "query"
    | "server_action"
    | "pattern_c_ui"
    | "ingest_resolution"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_EMPLOYEE_MAPPING_MAINTENANCE_SURFACES = [
  {
    operation: "list",
    door: "query",
    symbol: "listTimeClockMappingsForOrg",
    requirementCodes: ["HRM-TCI-005", "HRM-TCI-015"],
  },
  {
    operation: "create",
    door: "server_action",
    symbol: "upsertTimeClockMappingAction",
    requirementCodes: ["HRM-TCI-005", "HRM-TCI-027"],
  },
  {
    operation: "update",
    door: "server_action",
    symbol: "upsertTimeClockMappingAction",
    requirementCodes: ["HRM-TCI-005", "HRM-TCI-027"],
  },
  {
    operation: "list",
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.mappings,
    requirementCodes: ["HRM-TCI-005"],
  },
  {
    operation: "list",
    door: "ingest_resolution",
    symbol: "findActiveTimeClockMapping",
    requirementCodes: ["HRM-TCI-005", "HRM-TCI-015"],
  },
  {
    operation: "list",
    door: "ingest_resolution",
    symbol: "resolveTimeClockIngestContext",
    requirementCodes: ["HRM-TCI-005", "HRM-TCI-010", "HRM-TCI-015"],
  },
] as const satisfies readonly TciEmployeeMappingMaintenanceSurface[]

export function assertHrmTci005EmployeeMapping(): void {
  const identity = new Set(TCI_HRM_TCI_005_IDENTITY_FIELDS)
  if (identity.size !== TCI_HRM_TCI_005_IDENTITY_FIELDS.length) {
    throw new Error(
      "HRM-TCI-005 identity field manifest must not contain duplicates"
    )
  }

  for (const field of TCI_HRM_TCI_005_IDENTITY_FIELDS) {
    if (
      !TCI_EMPLOYEE_MAPPING_FIELD_BINDINGS.some(
        (binding) => binding.field === field
      )
    ) {
      throw new Error(
        `HRM-TCI-005 missing list binding for identity field "${field}"`
      )
    }
  }

  for (const surface of TCI_EMPLOYEE_MAPPING_MAINTENANCE_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-005")) {
      throw new Error(
        `TCI employee mapping surface "${surface.symbol}" must cite HRM-TCI-005`
      )
    }
  }

  for (const required of TCI_EMPLOYEE_MAPPING_MAINTENANCE_OPERATIONS) {
    if (
      !TCI_EMPLOYEE_MAPPING_MAINTENANCE_SURFACES.some(
        (s) => s.operation === required
      )
    ) {
      throw new Error(
        `HRM-TCI-005 missing maintenance surface for "${required}"`
      )
    }
  }

  const listColumns = new Set(
    TCI_EMPLOYEE_MAPPING_FIELD_BINDINGS.map((b) => b.listColumnId)
  )
  for (const required of [
    "employee",
    "device",
    "clockUser",
    "badge",
    "biometric",
    "status",
  ] as const) {
    if (!listColumns.has(required)) {
      throw new Error(
        `HRM-TCI-005 missing list column binding for "${required}"`
      )
    }
  }
}
