export const hrTalentEngAuditActions = {
  templateCreated: "hr.talent.eng.template.created",
  surveyCreated: "hr.talent.eng.survey.created",
  surveyPublished: "hr.talent.eng.survey.published",
  invitationBatchPublished: "hr.talent.eng.invitation.batch_published",
  responseDraftSaved: "hr.talent.eng.response.draft_saved",
  responseSubmitted: "hr.talent.eng.response.submitted",
  analyticsGenerated: "hr.talent.eng.analytics.generated",
  reportExported: "hr.talent.eng.report.exported",
  openTextTagged: "hr.talent.eng.open_text.tagged",
  improvementActionCreated: "hr.talent.eng.improvement_action.created",
  improvementActionUpdated: "hr.talent.eng.improvement_action.updated",
  improvementActionCompleted: "hr.talent.eng.improvement_action.completed",
  overdueNotificationSent: "hr.talent.eng.improvement_action.overdue_notified",
  integrationExposed: "hr.talent.eng.integration.exposed",
} as const;

export type HrTalentEngAuditAction =
  (typeof hrTalentEngAuditActions)[keyof typeof hrTalentEngAuditActions];
