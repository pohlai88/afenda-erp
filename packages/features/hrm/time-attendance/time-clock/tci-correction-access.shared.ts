/**
 * HRM-TCI-025 — restrict punch record correction to authorized ERP users.
 *
 * Two permission doors (HRM-TCI-024 workflow):
 * - Exception approve/reject → `hrm.time_clock_punch.update`
 * - LAM attendance correction → `hrm.attendance.update`
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import { TCI_CORRECTION_DECIDE_SYMBOL } from "./tci-correction-workflow.shared"

export const TCI_CORRECTION_HRM_MODULE = "hrm" as const

export const TCI_CORRECTION_EXCEPTION_DECIDE_PERMISSION = {
  module: TCI_CORRECTION_HRM_MODULE,
  object: "time_clock_punch",
  function: "update",
} as const

export const TCI_CORRECTION_LAM_PERMISSION = {
  module: TCI_CORRECTION_HRM_MODULE,
  object: "attendance",
  function: "update",
} as const

export const TCI_CORRECTION_ACCESS_RESOLVER_SYMBOL =
  "resolveTimeClockSurfaceAccess" as const

export const TCI_CORRECTION_EXCEPTION_DECIDE_ACTION_SYMBOL =
  "decideTimeClockPunchExceptionAction" as const

export const TCI_CORRECTION_LAM_ACTION_SYMBOL =
  "correctAttendanceEventAction" as const

export type TciCorrectionAccessSurface =
  | {
      readonly door: "erp_rbac"
      readonly symbol: typeof TCI_CORRECTION_EXCEPTION_DECIDE_PERMISSION.object
      readonly requirementCodes: readonly ["HRM-TCI-025"]
    }
  | {
      readonly door: "erp_rbac"
      readonly symbol: typeof TCI_CORRECTION_LAM_PERMISSION.object
      readonly requirementCodes: readonly ["HRM-TCI-025"]
    }
  | {
      readonly door: "server_action"
      readonly symbol: typeof TCI_CORRECTION_EXCEPTION_DECIDE_ACTION_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-024", "HRM-TCI-025"]
    }
  | {
      readonly door: "server_action"
      readonly symbol: typeof TCI_CORRECTION_LAM_ACTION_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-024", "HRM-TCI-025"]
    }
  | {
      readonly door: "pattern_c_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.correctionWorkflow
      readonly requirementCodes: readonly ["HRM-TCI-024", "HRM-TCI-025"]
    }
  | {
      readonly door: "pattern_c_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.exceptions
      readonly requirementCodes: readonly ["HRM-TCI-025"]
    }

export const TCI_CORRECTION_ACCESS_SURFACES = [
  {
    door: "erp_rbac",
    symbol: TCI_CORRECTION_EXCEPTION_DECIDE_PERMISSION.object,
    requirementCodes: ["HRM-TCI-025"],
  },
  {
    door: "erp_rbac",
    symbol: TCI_CORRECTION_LAM_PERMISSION.object,
    requirementCodes: ["HRM-TCI-025"],
  },
  {
    door: "server_action",
    symbol: TCI_CORRECTION_EXCEPTION_DECIDE_ACTION_SYMBOL,
    requirementCodes: ["HRM-TCI-024", "HRM-TCI-025"],
  },
  {
    door: "server_action",
    symbol: TCI_CORRECTION_LAM_ACTION_SYMBOL,
    requirementCodes: ["HRM-TCI-024", "HRM-TCI-025"],
  },
  {
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.correctionWorkflow,
    requirementCodes: ["HRM-TCI-024", "HRM-TCI-025"],
  },
  {
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.exceptions,
    requirementCodes: ["HRM-TCI-025"],
  },
] as const satisfies readonly TciCorrectionAccessSurface[]

export function assertHrmTci025CorrectionAccessControl(): void {
  if (TCI_CORRECTION_EXCEPTION_DECIDE_PERMISSION.function !== "update") {
    throw new Error("TCI exception decide must gate on time_clock_punch.update")
  }
  if (TCI_CORRECTION_LAM_PERMISSION.object !== "attendance") {
    throw new Error("TCI LAM correction must gate on attendance.update")
  }

  for (const surface of TCI_CORRECTION_ACCESS_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-025")) {
      throw new Error(
        `TCI correction access surface "${surface.symbol}" must cite HRM-TCI-025`
      )
    }
  }

  if (TCI_CORRECTION_DECIDE_SYMBOL !== "decideTimeClockPunchException") {
    throw new Error(
      "TCI-024 decide symbol must stay aligned with exception command"
    )
  }
}
