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
  workplaceSafety: {
    synced: "hr.compliance.workplace_safety.sync",
    statusUpdated: "hr.compliance.workplace_safety.status.update",
  },
  safetyTraining: {
    synced: "hr.compliance.safety_training.sync",
    statusUpdated: "hr.compliance.safety_training.status.update",
  },
  workEligibility: {
    ensured: "hr.compliance.work_eligibility.ensure",
    statusUpdated: "hr.compliance.work_eligibility.status.update",
  },
  workAuthDocuments: {
    ensured: "hr.compliance.work_auth_documents.ensure",
    statusUpdated: "hr.compliance.work_auth_documents.status.update",
  },
  policyAcknowledgement: {
    synced: "hr.compliance.policy_acknowledgement.sync",
    statusUpdated: "hr.compliance.policy_acknowledgement.status.update",
  },
  filing: {
    synced: "hr.compliance.filing.sync",
    statusUpdated: "hr.compliance.filing.status.update",
  },
} as const;

export type HrWorkforceComplianceAuditAction =
  | (typeof hrWorkforceComplianceAuditActions)["obligation"][keyof (typeof hrWorkforceComplianceAuditActions)["obligation"]]
  | (typeof hrWorkforceComplianceAuditActions)["exception"][keyof (typeof hrWorkforceComplianceAuditActions)["exception"]]
  | (typeof hrWorkforceComplianceAuditActions)["laborLaw"][keyof (typeof hrWorkforceComplianceAuditActions)["laborLaw"]]
  | (typeof hrWorkforceComplianceAuditActions)["workplaceSafety"][keyof (typeof hrWorkforceComplianceAuditActions)["workplaceSafety"]]
  | (typeof hrWorkforceComplianceAuditActions)["safetyTraining"][keyof (typeof hrWorkforceComplianceAuditActions)["safetyTraining"]]
  | (typeof hrWorkforceComplianceAuditActions)["workEligibility"][keyof (typeof hrWorkforceComplianceAuditActions)["workEligibility"]]
  | (typeof hrWorkforceComplianceAuditActions)["workAuthDocuments"][keyof (typeof hrWorkforceComplianceAuditActions)["workAuthDocuments"]]
  | (typeof hrWorkforceComplianceAuditActions)["policyAcknowledgement"][keyof (typeof hrWorkforceComplianceAuditActions)["policyAcknowledgement"]]
  | (typeof hrWorkforceComplianceAuditActions)["filing"][keyof (typeof hrWorkforceComplianceAuditActions)["filing"]];
