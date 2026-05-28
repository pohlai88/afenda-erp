/**
 * HRM-TCI-014 — validate punch records against active employee status (`employmentStatus === "active"`).
 *
 * Enforced in `evaluateTimeClockPunch` before device mapping, dedup, and shift checks.
 * Rejected punches write `inactive_employee` (or `unknown_employee`) to the exception inbox.
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import {
  TCI_DETECTION_OUTCOMES,
  type TciDetectionOutcome,
} from "./schemas/tci-workflow-state.shared"

export const TCI_ACTIVE_EMPLOYEE_EMPLOYMENT_STATUS = "active" as const

export const TCI_ACTIVE_EMPLOYEE_STATUS_COLUMN = "employmentStatus" as const

export const TCI_ACTIVE_EMPLOYEE_TABLE = "hrm_employee" as const

export const TCI_INACTIVE_EMPLOYEE_DETECTION_OUTCOME =
  "inactive_employee" as const satisfies TciDetectionOutcome

export const TCI_UNKNOWN_EMPLOYEE_DETECTION_OUTCOME =
  "unknown_employee" as const satisfies TciDetectionOutcome

export const TCI_ACTIVE_EMPLOYEE_VALIDATION_SYMBOL =
  "evaluateTimeClockPunch" as const

export const TCI_ACTIVE_EMPLOYEE_PERSIST_SYMBOL =
  "persistTimeClockPunch" as const

export type TciActiveEmployeeValidationSurface = {
  readonly door:
    | "validation"
    | "persist"
    | "batch_ingest"
    | "manual_import"
    | "pattern_c_ui"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_ACTIVE_EMPLOYEE_VALIDATION_SURFACES = [
  {
    door: "validation",
    symbol: TCI_ACTIVE_EMPLOYEE_VALIDATION_SYMBOL,
    requirementCodes: ["HRM-TCI-014", "HRM-TCI-013"],
  },
  {
    door: "persist",
    symbol: TCI_ACTIVE_EMPLOYEE_PERSIST_SYMBOL,
    requirementCodes: ["HRM-TCI-014", "HRM-TCI-006"],
  },
  {
    door: "batch_ingest",
    symbol: "ingestTimeClockBatch",
    requirementCodes: [
      "HRM-TCI-014",
      "HRM-TCI-008",
      "HRM-TCI-010",
      "HRM-TCI-012",
    ],
  },
  {
    door: "manual_import",
    symbol: "timeClockManualImportAdapter",
    requirementCodes: ["HRM-TCI-014", "HRM-TCI-009"],
  },
  {
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.exceptions,
    requirementCodes: ["HRM-TCI-014", "HRM-TCI-024"],
  },
] as const satisfies readonly TciActiveEmployeeValidationSurface[]

export type TimeClockEmployeeStatusRow = {
  readonly employmentStatus: string
}

export type TimeClockEmployeeStatusValidationResult =
  | {
      readonly ok: true
      readonly employmentStatus: typeof TCI_ACTIVE_EMPLOYEE_EMPLOYMENT_STATUS
    }
  | {
      readonly ok: false
      readonly outcome: typeof TCI_UNKNOWN_EMPLOYEE_DETECTION_OUTCOME
      readonly message: string
    }
  | {
      readonly ok: false
      readonly outcome: typeof TCI_INACTIVE_EMPLOYEE_DETECTION_OUTCOME
      readonly message: string
    }

/**
 * Pure gate used by server validation — only `employmentStatus === "active"` may ingest device punches.
 */
export function resolveTimeClockEmployeeStatusValidation(
  employee: TimeClockEmployeeStatusRow | null | undefined
): TimeClockEmployeeStatusValidationResult {
  if (!employee) {
    return {
      ok: false,
      outcome: TCI_UNKNOWN_EMPLOYEE_DETECTION_OUTCOME,
      message: "Employee not found.",
    }
  }

  if (employee.employmentStatus !== TCI_ACTIVE_EMPLOYEE_EMPLOYMENT_STATUS) {
    return {
      ok: false,
      outcome: TCI_INACTIVE_EMPLOYEE_DETECTION_OUTCOME,
      message: "Employee is not active.",
    }
  }

  return { ok: true, employmentStatus: TCI_ACTIVE_EMPLOYEE_EMPLOYMENT_STATUS }
}

export function isTciPunchEligibleEmploymentStatus(status: string): boolean {
  return status === TCI_ACTIVE_EMPLOYEE_EMPLOYMENT_STATUS
}

export function assertHrmTci014ActiveEmployeeValidation(): void {
  for (const surface of TCI_ACTIVE_EMPLOYEE_VALIDATION_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-014")) {
      throw new Error(
        `TCI active employee surface "${surface.symbol}" must cite HRM-TCI-014`
      )
    }
  }

  if (
    !(TCI_DETECTION_OUTCOMES as readonly string[]).includes(
      TCI_INACTIVE_EMPLOYEE_DETECTION_OUTCOME
    )
  ) {
    throw new Error("TCI_DETECTION_OUTCOMES must include inactive_employee")
  }

  const inactive = resolveTimeClockEmployeeStatusValidation({
    employmentStatus: "terminated",
  })
  if (
    inactive.ok ||
    inactive.outcome !== TCI_INACTIVE_EMPLOYEE_DETECTION_OUTCOME
  ) {
    throw new Error("terminated employment must fail HRM-TCI-014")
  }

  const active = resolveTimeClockEmployeeStatusValidation({
    employmentStatus: TCI_ACTIVE_EMPLOYEE_EMPLOYMENT_STATUS,
  })
  if (!active.ok) {
    throw new Error("active employment must pass HRM-TCI-014")
  }
}
