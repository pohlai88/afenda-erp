/**
 * HRM-TCI-030 — IAM audit trail for time clock mutations (`iam_audit_event`).
 *
 * Writers call `writeIamAuditEventFromNextHeaders` with `HRM_TCI_AUDIT` actions after
 * successful commits. LAM attendance corrections from the exception inbox use
 * `submitAttendanceCorrectionForApproval` (`erp.hrm.attendance.correction.*`).
 */

import { HRM_TCI_AUDIT, type HrmTciAuditAction } from "./tci.contract"
import { TCI_CORRECTION_LAM_SUBMIT_SYMBOL } from "./tci-correction-workflow.shared"
import {
  TCI_LIST_SURFACE_IDS,
  TCI_STAT_SURFACE_KEY,
} from "./data/tci-surface-metadata.shared"

export const TCI_AUDIT_LEDGER_TABLE = "iam_audit_event" as const

export const TCI_AUDIT_ACTION_PREFIX = "erp.hrm.time_clock" as const

export const TCI_AUDIT_LAM_CORRECTION_SYMBOL = TCI_CORRECTION_LAM_SUBMIT_SYMBOL

export const TCI_AUDIT_TRAIL_LIST_SYMBOL =
  "listTimeClockAuditTrailForOrg" as const

export const TCI_AUDIT_DOMAINS = [
  "device_setup",
  "employee_mapping",
  "punch_capture",
  "sync",
  "import",
  "validation",
  "correction",
  "deletion",
  "exception_handling",
  "reporting",
] as const

export type TciAuditDomain = (typeof TCI_AUDIT_DOMAINS)[number]

export const TCI_AUDIT_DOMAIN_ACTIONS = {
  device_setup: [
    HRM_TCI_AUDIT.deviceCreate,
    HRM_TCI_AUDIT.deviceUpdate,
    HRM_TCI_AUDIT.deviceRevoke,
  ],
  employee_mapping: [HRM_TCI_AUDIT.mappingCreate, HRM_TCI_AUDIT.mappingUpdate],
  punch_capture: [HRM_TCI_AUDIT.punchCreate, HRM_TCI_AUDIT.punchSearch],
  sync: [HRM_TCI_AUDIT.syncRun, HRM_TCI_AUDIT.syncFail],
  import: [HRM_TCI_AUDIT.syncRun],
  validation: [HRM_TCI_AUDIT.exceptionSubmit],
  correction: [
    HRM_TCI_AUDIT.exceptionApprove,
    HRM_TCI_AUDIT.exceptionReject,
    TCI_AUDIT_LAM_CORRECTION_SYMBOL,
  ],
  deletion: [HRM_TCI_AUDIT.deviceRevoke],
  exception_handling: [
    HRM_TCI_AUDIT.exceptionSubmit,
    HRM_TCI_AUDIT.exceptionApprove,
    HRM_TCI_AUDIT.exceptionReject,
  ],
  reporting: [HRM_TCI_AUDIT.reportExport],
} as const satisfies Record<
  TciAuditDomain,
  readonly (HrmTciAuditAction | string)[]
>

export type TciAuditTrailEmitter =
  | {
      readonly door: "device_commands"
      readonly symbol: "upsertTimeClockDevice"
      readonly auditKeys: readonly [
        typeof HRM_TCI_AUDIT.deviceCreate,
        typeof HRM_TCI_AUDIT.deviceUpdate,
        typeof HRM_TCI_AUDIT.deviceRevoke,
      ]
      readonly requirementCodes: readonly ["HRM-TCI-003", "HRM-TCI-030"]
    }
  | {
      readonly door: "mapping_commands"
      readonly symbol: "upsertTimeClockMapping"
      readonly auditKeys: readonly [
        typeof HRM_TCI_AUDIT.mappingCreate,
        typeof HRM_TCI_AUDIT.mappingUpdate,
      ]
      readonly requirementCodes: readonly ["HRM-TCI-005", "HRM-TCI-030"]
    }
  | {
      readonly door: "punch_commands"
      readonly symbol: "persistTimeClockPunch"
      readonly auditKeys: readonly [
        typeof HRM_TCI_AUDIT.punchCreate,
        typeof HRM_TCI_AUDIT.exceptionSubmit,
      ]
      readonly requirementCodes: readonly ["HRM-TCI-006", "HRM-TCI-030"]
    }
  | {
      readonly door: "punch_commands"
      readonly symbol: "ingestTimeClockBatch"
      readonly auditKeys: readonly [typeof HRM_TCI_AUDIT.syncRun]
      readonly requirementCodes: readonly ["HRM-TCI-008", "HRM-TCI-030"]
    }
  | {
      readonly door: "sync_watch"
      readonly symbol: "runTimeClockSyncWatchTick"
      readonly auditKeys: readonly [typeof HRM_TCI_AUDIT.syncFail]
      readonly requirementCodes: readonly ["HRM-TCI-026", "HRM-TCI-030"]
    }
  | {
      readonly door: "exception_commands"
      readonly symbol: "decideTimeClockPunchException"
      readonly auditKeys: readonly [
        typeof HRM_TCI_AUDIT.exceptionApprove,
        typeof HRM_TCI_AUDIT.exceptionReject,
      ]
      readonly requirementCodes: readonly ["HRM-TCI-024", "HRM-TCI-030"]
    }
  | {
      readonly door: "report_action"
      readonly symbol: "exportTimeClockReportAction"
      readonly auditKeys: readonly [typeof HRM_TCI_AUDIT.reportExport]
      readonly requirementCodes: readonly ["HRM-TCI-028", "HRM-TCI-030"]
    }
  | {
      readonly door: "lam_correction"
      readonly symbol: typeof TCI_AUDIT_LAM_CORRECTION_SYMBOL
      readonly auditKeys: readonly ["erp.hrm.attendance.correction.submit"]
      readonly requirementCodes: readonly [
        "HRM-TCI-024",
        "HRM-TCI-025",
        "HRM-TCI-030",
      ]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.auditTrail
      readonly auditKeys: readonly []
      readonly requirementCodes: readonly ["HRM-TCI-030"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_STAT_SURFACE_KEY
      readonly requirementCodes: readonly ["HRM-TCI-030"]
    }
  | {
      readonly door: "report_csv"
      readonly symbol: "audit_trail"
      readonly requirementCodes: readonly ["HRM-TCI-028", "HRM-TCI-030"]
    }

export const TCI_AUDIT_TRAIL_SURFACES = [
  {
    door: "device_commands",
    symbol: "upsertTimeClockDevice",
    auditKeys: [
      HRM_TCI_AUDIT.deviceCreate,
      HRM_TCI_AUDIT.deviceUpdate,
      HRM_TCI_AUDIT.deviceRevoke,
    ],
    requirementCodes: ["HRM-TCI-003", "HRM-TCI-030"],
  },
  {
    door: "mapping_commands",
    symbol: "upsertTimeClockMapping",
    auditKeys: [HRM_TCI_AUDIT.mappingCreate, HRM_TCI_AUDIT.mappingUpdate],
    requirementCodes: ["HRM-TCI-005", "HRM-TCI-030"],
  },
  {
    door: "punch_commands",
    symbol: "persistTimeClockPunch",
    auditKeys: [HRM_TCI_AUDIT.punchCreate, HRM_TCI_AUDIT.exceptionSubmit],
    requirementCodes: ["HRM-TCI-006", "HRM-TCI-030"],
  },
  {
    door: "punch_commands",
    symbol: "ingestTimeClockBatch",
    auditKeys: [HRM_TCI_AUDIT.syncRun],
    requirementCodes: ["HRM-TCI-008", "HRM-TCI-030"],
  },
  {
    door: "sync_watch",
    symbol: "runTimeClockSyncWatchTick",
    auditKeys: [HRM_TCI_AUDIT.syncFail],
    requirementCodes: ["HRM-TCI-026", "HRM-TCI-030"],
  },
  {
    door: "exception_commands",
    symbol: "decideTimeClockPunchException",
    auditKeys: [HRM_TCI_AUDIT.exceptionApprove, HRM_TCI_AUDIT.exceptionReject],
    requirementCodes: ["HRM-TCI-024", "HRM-TCI-030"],
  },
  {
    door: "report_action",
    symbol: "exportTimeClockReportAction",
    auditKeys: [HRM_TCI_AUDIT.reportExport],
    requirementCodes: ["HRM-TCI-028", "HRM-TCI-030"],
  },
  {
    door: "lam_correction",
    symbol: TCI_AUDIT_LAM_CORRECTION_SYMBOL,
    auditKeys: ["erp.hrm.attendance.correction.submit"],
    requirementCodes: ["HRM-TCI-024", "HRM-TCI-025", "HRM-TCI-030"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.auditTrail,
    auditKeys: [],
    requirementCodes: ["HRM-TCI-030"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_STAT_SURFACE_KEY,
    requirementCodes: ["HRM-TCI-030"],
  },
  {
    door: "report_csv",
    symbol: "audit_trail",
    requirementCodes: ["HRM-TCI-028", "HRM-TCI-030"],
  },
] as const satisfies readonly TciAuditTrailEmitter[]

function isHrmTciAuditAction(value: string): value is HrmTciAuditAction {
  return (Object.values(HRM_TCI_AUDIT) as readonly string[]).includes(value)
}

export function assertHrmTci030AuditTrail(): void {
  for (const action of Object.values(HRM_TCI_AUDIT)) {
    if (!action.startsWith(TCI_AUDIT_ACTION_PREFIX)) {
      throw new Error(
        `TCI audit action "${action}" must use prefix ${TCI_AUDIT_ACTION_PREFIX}`
      )
    }
  }

  const assigned = new Set<string>()
  for (const domain of TCI_AUDIT_DOMAINS) {
    const actions = TCI_AUDIT_DOMAIN_ACTIONS[domain]
    for (const action of actions) {
      if (typeof action === "string" && isHrmTciAuditAction(action)) {
        assigned.add(action)
      }
    }
  }

  for (const action of Object.values(HRM_TCI_AUDIT)) {
    if (!assigned.has(action)) {
      throw new Error(
        `HRM_TCI_AUDIT.${action} must be assigned to a TCI audit domain`
      )
    }
  }

  for (const surface of TCI_AUDIT_TRAIL_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-030")) {
      throw new Error(
        `TCI audit trail surface "${surface.symbol}" must cite HRM-TCI-030`
      )
    }
  }

  if (
    !TCI_AUDIT_DOMAIN_ACTIONS.validation.includes(HRM_TCI_AUDIT.exceptionSubmit)
  ) {
    throw new Error("validation domain must include exceptionSubmit audit")
  }
  if (!TCI_AUDIT_DOMAIN_ACTIONS.deletion.includes(HRM_TCI_AUDIT.deviceRevoke)) {
    throw new Error("deletion domain must include deviceRevoke audit")
  }
}
