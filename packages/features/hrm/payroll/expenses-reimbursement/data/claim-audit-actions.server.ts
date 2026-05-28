import "server-only"

import { HRM_ESS_AUDIT } from "../../../employees/server"
import { HRM_EXPENSE_REIMBURSEMENT_AUDIT } from "../expense-reimbursement.contract"

/** Resolve claim submit/cancel/evidence audit strings for org apps vs employee portal. */
export function resolveClaimSubmitAuditAction(employeePortal: boolean): string {
  return employeePortal
    ? HRM_ESS_AUDIT.claim.submit
    : HRM_EXPENSE_REIMBURSEMENT_AUDIT.claim.submit
}

export function resolveClaimCancelAuditAction(employeePortal: boolean): string {
  return employeePortal
    ? HRM_ESS_AUDIT.claim.cancel
    : HRM_EXPENSE_REIMBURSEMENT_AUDIT.claim.cancel
}

export function resolveClaimAttachEvidenceAuditAction(
  employeePortal: boolean
): string {
  return employeePortal
    ? HRM_ESS_AUDIT.claim.attachEvidence
    : HRM_EXPENSE_REIMBURSEMENT_AUDIT.claim.attachEvidence
}
