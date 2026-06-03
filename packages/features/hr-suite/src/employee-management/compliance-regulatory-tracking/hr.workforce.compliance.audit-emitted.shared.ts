import { hrWorkforceComplianceAuditActions } from "./hr.workforce.compliance.event";

/** IAM audit action prefix for compliance mutations (HRM-CMP-025). */
export const HR_COMPLIANCE_AUDIT_MODULE_KEY = "hr.compliance" as const;

function collectAuditActionValues(
  group: Record<string, string>,
): readonly string[] {
  return Object.values(group);
}

/** Canonical manifest of user-initiated compliance audit emitters. */
export const HR_COMPLIANCE_EMITTED_AUDIT_ACTIONS = [
  ...collectAuditActionValues(hrWorkforceComplianceAuditActions.obligation),
  ...collectAuditActionValues(hrWorkforceComplianceAuditActions.exception),
  ...collectAuditActionValues(hrWorkforceComplianceAuditActions.laborLaw),
  ...collectAuditActionValues(hrWorkforceComplianceAuditActions.statutory),
  ...collectAuditActionValues(hrWorkforceComplianceAuditActions.workplaceSafety),
  ...collectAuditActionValues(hrWorkforceComplianceAuditActions.safetyTraining),
  ...collectAuditActionValues(hrWorkforceComplianceAuditActions.workEligibility),
  ...collectAuditActionValues(hrWorkforceComplianceAuditActions.workAuthDocuments),
  ...collectAuditActionValues(
    hrWorkforceComplianceAuditActions.policyAcknowledgement,
  ),
  ...collectAuditActionValues(hrWorkforceComplianceAuditActions.filing),
  ...collectAuditActionValues(hrWorkforceComplianceAuditActions.evidence),
  ...collectAuditActionValues(hrWorkforceComplianceAuditActions.reviewQueue),
  ...collectAuditActionValues(hrWorkforceComplianceAuditActions.reports),
] as const;

export type HrComplianceEmittedAuditAction =
  (typeof HR_COMPLIANCE_EMITTED_AUDIT_ACTIONS)[number];

export function isHrComplianceAuditAction(
  action: string,
): action is HrComplianceEmittedAuditAction {
  return (HR_COMPLIANCE_EMITTED_AUDIT_ACTIONS as readonly string[]).includes(
    action,
  );
}
