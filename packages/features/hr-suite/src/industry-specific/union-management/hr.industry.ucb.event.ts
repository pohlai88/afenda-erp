export const hrIndustryUcbAuditActions = {
  unionCreated: "hr.industry.ucb.union.created",
  unionUpdated: "hr.industry.ucb.union.updated",
  cbaCreated: "hr.industry.ucb.cba.created",
  cbaRuleChanged: "hr.industry.ucb.cba.rule_changed",
  cbaRenewalTracked: "hr.industry.ucb.cba.renewal_tracked",
  bargainingUnitAssigned: "hr.industry.ucb.bargaining_unit.assigned",
  membershipUpdated: "hr.industry.ucb.membership.updated",
  seniorityUpdated: "hr.industry.ucb.seniority.updated",
  ruleConflictFlagged: "hr.industry.ucb.rule_conflict.flagged",
  duesReferenceApproved: "hr.industry.ucb.dues_reference.approved",
  duesReferenceExposed: "hr.industry.ucb.dues_reference.exposed",
  grievanceCreated: "hr.industry.ucb.grievance.created",
  grievanceStepAdvanced: "hr.industry.ucb.grievance.step_advanced",
  grievanceClosed: "hr.industry.ucb.grievance.closed",
  disputeEscalated: "hr.industry.ucb.dispute.escalated",
  representativeUpdated: "hr.industry.ucb.representative.updated",
  laborMeetingRecorded: "hr.industry.ucb.labor_meeting.recorded",
  alertGenerated: "hr.industry.ucb.alert.generated",
  integrationExposed: "hr.industry.ucb.integration.exposed",
  reportExported: "hr.industry.ucb.report.exported",
  restrictedAccessRecorded: "hr.industry.ucb.restricted_access.recorded",
} as const;

export type HrIndustryUcbAuditAction =
  (typeof hrIndustryUcbAuditActions)[keyof typeof hrIndustryUcbAuditActions];
