export const hrIndustryFhcAuditActions = {
  requirementRuleUpdated: "hr.fhc.requirement-rule.updated",
  employeeRequirementIdentified: "hr.fhc.employee-requirement.identified",
  permitSubmitted: "hr.fhc.permit.submitted",
  permitRenewed: "hr.fhc.permit.renewed",
  expiryAlertGenerated: "hr.fhc.expiry-alert.generated",
  trainingCompleted: "hr.fhc.training.completed",
  healthCertificationSubmitted: "hr.fhc.health-certification.submitted",
  evidenceVerified: "hr.fhc.evidence.verified",
  evidenceRejected: "hr.fhc.evidence.rejected",
  eligibilityEvaluated: "hr.fhc.eligibility.evaluated",
  dutyRestrictionApplied: "hr.fhc.duty-restriction.applied",
  dutyRestrictionLifted: "hr.fhc.duty-restriction.lifted",
  integrationExposed: "hr.fhc.integration.exposed",
  complianceReviewed: "hr.fhc.compliance.reviewed",
} as const;

export type HrIndustryFhcAuditAction =
  (typeof hrIndustryFhcAuditActions)[keyof typeof hrIndustryFhcAuditActions];
