/** Audit action strings for compliance mutations (HRM-CMP-025 foundation). */
export const hrWorkforceComplianceAuditActions = {
  obligation: {
    configured: "hr.compliance.obligation.create",
    archived: "hr.compliance.obligation.archive",
  },
  exception: {
    created: "hr.compliance.exception.create",
    correctiveActionAssigned: "hr.compliance.exception.corrective_action.assign",
    correctiveActionUpdated: "hr.compliance.exception.corrective_action.update",
    resolved: "hr.compliance.exception.resolve",
    waived: "hr.compliance.exception.waive",
  },
  laborLaw: {
    synced: "hr.compliance.labor_law.sync",
    statusUpdated: "hr.compliance.labor_law.status.update",
  },
  workEligibility: {
    ensured: "hr.compliance.work_eligibility.ensure",
    statusUpdated: "hr.compliance.work_eligibility.status.update",
  },
} as const;

export type HrWorkforceComplianceAuditAction =
  | (typeof hrWorkforceComplianceAuditActions)["obligation"][keyof (typeof hrWorkforceComplianceAuditActions)["obligation"]]
  | (typeof hrWorkforceComplianceAuditActions)["exception"][keyof (typeof hrWorkforceComplianceAuditActions)["exception"]]
  | (typeof hrWorkforceComplianceAuditActions)["laborLaw"][keyof (typeof hrWorkforceComplianceAuditActions)["laborLaw"]]
  | (typeof hrWorkforceComplianceAuditActions)["workEligibility"][keyof (typeof hrWorkforceComplianceAuditActions)["workEligibility"]];
