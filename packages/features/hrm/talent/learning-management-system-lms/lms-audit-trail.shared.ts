/**
 * HRM-LMS-030 — IAM audit trail for LMS mutations (`iam_audit_event`).
 *
 * Writers call `writeIamAuditEventFromNextHeaders` with `HRM_LMS_AUDIT` actions after
 * successful commits. Read model filters `erp.hrm.lms_*` action prefix.
 */

import { HRM_LMS_AUDIT } from "./lms.contract"

export const LMS_AUDIT_LEDGER_TABLE = "iam_audit_event" as const

export const LMS_AUDIT_ACTION_PREFIX = "erp.hrm.lms" as const

export const LMS_AUDIT_TRAIL_SURFACE_KEY = "hrm:lms:audit-trail" as const

export const LMS_AUDIT_TRAIL_LIST_SYMBOL = "listLmsAuditTrailForOrg" as const

export const LMS_AUDIT_TRAIL_LIST_COLUMNS_ID = "hrm-lms-audit-trail" as const

export function isLmsAuditAction(action: string): boolean {
  return action.startsWith(`${LMS_AUDIT_ACTION_PREFIX}_`)
}

export function listLmsAuditContractActions(): readonly string[] {
  return Object.values(HRM_LMS_AUDIT)
}
