/** Audit action strings for FWA compliance and cross-module references (HRM-FWA-032). */
export const hrTimeFwaComplianceAuditActions = {
  compliance: {
    monitored: "hr.fwa.compliance.monitored",
    breachFlagged: "hr.fwa.compliance.breach.flagged",
    breachResolved: "hr.fwa.compliance.breach.resolved",
  },
  integration: {
    attendanceCompared: "hr.fwa.integration.attendance.compared",
    remoteCheckinCompared: "hr.fwa.integration.remote_checkin.compared",
    leaveValidated: "hr.fwa.integration.leave.validated",
    lamScheduleRefListed: "hr.fwa.integration.lam.schedule_ref.listed",
    overtimeHourRefListed: "hr.fwa.integration.overtime.hour_ref.listed",
    payrollScheduleRefListed: "hr.fwa.integration.payroll.schedule_ref.listed",
  },
} as const;

export type HrTimeFwaComplianceAuditAction =
  | (typeof hrTimeFwaComplianceAuditActions.compliance)[keyof typeof hrTimeFwaComplianceAuditActions.compliance]
  | (typeof hrTimeFwaComplianceAuditActions.integration)[keyof typeof hrTimeFwaComplianceAuditActions.integration];

function collectAuditActionValues(
  group: Record<string, string>,
): readonly string[] {
  return Object.values(group);
}

/** Canonical manifest of FWA compliance audit emitters (HRM-FWA-018 … FWA-027). */
export const HR_FWA_COMPLIANCE_EMITTED_AUDIT_ACTIONS = [
  ...collectAuditActionValues(hrTimeFwaComplianceAuditActions.compliance),
  ...collectAuditActionValues(hrTimeFwaComplianceAuditActions.integration),
] as const;

export type HrFwaComplianceEmittedAuditAction =
  (typeof HR_FWA_COMPLIANCE_EMITTED_AUDIT_ACTIONS)[number];

export function isHrFwaComplianceAuditAction(
  action: string,
): action is HrFwaComplianceEmittedAuditAction {
  return (HR_FWA_COMPLIANCE_EMITTED_AUDIT_ACTIONS as readonly string[]).includes(
    action,
  );
}

/** Requirement codes covered by compliance + integration modules (FWA-018 … FWA-027). */
export const HR_FWA_COMPLIANCE_REQUIREMENT_CODES = [
  "HRM-FWA-018",
  "HRM-FWA-019",
  "HRM-FWA-020",
  "HRM-FWA-021",
  "HRM-FWA-022",
  "HRM-FWA-023",
  "HRM-FWA-024",
  "HRM-FWA-025",
  "HRM-FWA-026",
  "HRM-FWA-027",
] as const;

export type HrFwaComplianceRequirementCode =
  (typeof HR_FWA_COMPLIANCE_REQUIREMENT_CODES)[number];
