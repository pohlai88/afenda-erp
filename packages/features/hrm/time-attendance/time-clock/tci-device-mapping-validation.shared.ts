/**
 * HRM-TCI-015 — validate punch records against employee-device mapping.
 *
 * Ingest keys `(organization, device, clockUserId)` via `findActiveTimeClockMapping`;
 * punch `employeeId` must match the active mapping row (HRM-TCI-005 maintenance).
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import { TCI_EMPLOYEE_MAPPING_TABLE } from "./tci-employee-mapping.shared"
import {
  TCI_DETECTION_OUTCOMES,
  type TciDetectionOutcome,
} from "./schemas/tci-workflow-state.shared"

export { TCI_EMPLOYEE_MAPPING_TABLE as TCI_DEVICE_MAPPING_TABLE } from "./tci-employee-mapping.shared"

export const TCI_DEVICE_MAPPING_ACTIVE_STATE = "active" as const

export const TCI_DEVICE_MAPPING_CLOCK_USER_FIELD = "clockUserId" as const

export const TCI_UNMAPPED_DEVICE_USER_DETECTION_OUTCOME =
  "unmapped_device_user" as const satisfies TciDetectionOutcome

export const TCI_DEVICE_MAPPING_LOOKUP_SYMBOL =
  "findActiveTimeClockMapping" as const

export const TCI_DEVICE_MAPPING_VALIDATION_SYMBOL =
  "evaluateTimeClockPunch" as const

export const TCI_DEVICE_MAPPING_INGEST_RESOLUTION_SYMBOL =
  "resolveTimeClockIngestContext" as const

export type TciDeviceMappingValidationSurface = {
  readonly door: "validation" | "ingest_resolution" | "pattern_c_ui"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_DEVICE_MAPPING_VALIDATION_SURFACES = [
  {
    door: "validation",
    symbol: TCI_DEVICE_MAPPING_VALIDATION_SYMBOL,
    requirementCodes: ["HRM-TCI-015", "HRM-TCI-014", "HRM-TCI-013"],
  },
  {
    door: "ingest_resolution",
    symbol: TCI_DEVICE_MAPPING_LOOKUP_SYMBOL,
    requirementCodes: ["HRM-TCI-015", "HRM-TCI-005"],
  },
  {
    door: "ingest_resolution",
    symbol: TCI_DEVICE_MAPPING_INGEST_RESOLUTION_SYMBOL,
    requirementCodes: ["HRM-TCI-015", "HRM-TCI-005", "HRM-TCI-010"],
  },
  {
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.mappings,
    requirementCodes: ["HRM-TCI-005", "HRM-TCI-015"],
  },
  {
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.exceptions,
    requirementCodes: ["HRM-TCI-015", "HRM-TCI-024"],
  },
] as const satisfies readonly TciDeviceMappingValidationSurface[]

export type TimeClockActiveDeviceMappingRow = {
  readonly employeeId: string
}

export type TimeClockDeviceMappingValidationResult =
  | { readonly ok: true; readonly employeeId: string }
  | {
      readonly ok: false
      readonly outcome: typeof TCI_UNMAPPED_DEVICE_USER_DETECTION_OUTCOME
      readonly message: string
    }

/**
 * Pure gate after `findActiveTimeClockMapping` — mapping must exist and match punch employee.
 */
export function resolveTimeClockDeviceMappingValidation(input: {
  mapping: TimeClockActiveDeviceMappingRow | null | undefined
  expectedEmployeeId: string
}): TimeClockDeviceMappingValidationResult {
  if (!input.mapping || input.mapping.employeeId !== input.expectedEmployeeId) {
    return {
      ok: false,
      outcome: TCI_UNMAPPED_DEVICE_USER_DETECTION_OUTCOME,
      message: "Clock user is not mapped to this employee on this device.",
    }
  }

  return { ok: true, employeeId: input.mapping.employeeId }
}

export function assertHrmTci015DeviceMappingValidation(): void {
  if (TCI_DEVICE_MAPPING_ACTIVE_STATE !== "active") {
    throw new Error("HRM-TCI-015 requires active mapping state")
  }

  if (TCI_EMPLOYEE_MAPPING_TABLE !== "hrm_time_clock_employee_mapping") {
    throw new Error("HRM-TCI-015 mapping table binding drifted")
  }

  for (const surface of TCI_DEVICE_MAPPING_VALIDATION_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-015")) {
      throw new Error(
        `TCI device mapping surface "${surface.symbol}" must cite HRM-TCI-015`
      )
    }
  }

  if (
    !(TCI_DETECTION_OUTCOMES as readonly string[]).includes(
      TCI_UNMAPPED_DEVICE_USER_DETECTION_OUTCOME
    )
  ) {
    throw new Error("TCI_DETECTION_OUTCOMES must include unmapped_device_user")
  }

  const missing = resolveTimeClockDeviceMappingValidation({
    mapping: null,
    expectedEmployeeId: "emp-1",
  })
  if (
    missing.ok ||
    missing.outcome !== TCI_UNMAPPED_DEVICE_USER_DETECTION_OUTCOME
  ) {
    throw new Error("missing mapping must fail HRM-TCI-015")
  }

  const mismatch = resolveTimeClockDeviceMappingValidation({
    mapping: { employeeId: "emp-a" },
    expectedEmployeeId: "emp-b",
  })
  if (
    mismatch.ok ||
    mismatch.outcome !== TCI_UNMAPPED_DEVICE_USER_DETECTION_OUTCOME
  ) {
    throw new Error("employee mismatch must fail HRM-TCI-015")
  }

  const ok = resolveTimeClockDeviceMappingValidation({
    mapping: { employeeId: "emp-a" },
    expectedEmployeeId: "emp-a",
  })
  if (!ok.ok || ok.employeeId !== "emp-a") {
    throw new Error("matching mapping must pass HRM-TCI-015")
  }
}
