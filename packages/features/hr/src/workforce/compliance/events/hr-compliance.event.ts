export const hrComplianceAuditActions = {
  upsertObligation: "hr.compliance.obligation.upsert",
  archiveObligation: "hr.compliance.obligation.archive",
  createException: "hr.compliance.exception.create",
  resolveException: "hr.compliance.exception.resolve",
  assignCorrectiveAction: "hr.compliance.exception.corrective_action.assign",
  updateCorrectiveActionProgress:
    "hr.compliance.exception.corrective_action.progress",
  waiveException: "hr.compliance.exception.waive",
} as const;
