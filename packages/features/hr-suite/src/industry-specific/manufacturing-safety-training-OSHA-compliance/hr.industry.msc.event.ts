export const hrIndustryMscAuditActions = {
  requirementConfigured: "hr.msc.requirement.configured",
  employeeRequirementIdentified: "hr.msc.employee-requirement.identified",
  trainingAssigned: "hr.msc.training.assigned",
  trainingCompleted: "hr.msc.training.completed",
  ppeAcknowledged: "hr.msc.ppe.acknowledged",
  certificateRenewed: "hr.msc.certificate.renewed",
  hazardAssessmentReviewed: "hr.msc.hazard-assessment.reviewed",
  incidentReported: "hr.msc.incident.reported",
  oshaRecordkeepingReferenced: "hr.msc.osha-recordkeeping.referenced",
  correctiveActionAssigned: "hr.msc.corrective-action.assigned",
  correctiveActionCompleted: "hr.msc.corrective-action.completed",
  workRestrictionApplied: "hr.msc.work-restriction.applied",
  notificationGenerated: "hr.msc.notification.generated",
  integrationExposed: "hr.msc.integration.exposed",
  reportGenerated: "hr.msc.report.generated",
  complianceReviewed: "hr.msc.compliance.reviewed",
} as const;

export type HrIndustryMscAuditAction =
  (typeof hrIndustryMscAuditActions)[keyof typeof hrIndustryMscAuditActions];
