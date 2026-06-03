export const hrTalentRssAuditActions = {
  candidateProfileCreated: "hr.talent.rss.candidate_profile.created",
  candidateProfileUpdated: "hr.talent.rss.candidate_profile.updated",
  jobPostingViewed: "hr.talent.rss.job_posting.viewed",
  applicationSubmitted: "hr.talent.rss.application.submitted",
  applicationWithdrawn: "hr.talent.rss.application.withdrawn",
  documentUploaded: "hr.talent.rss.document.uploaded",
  interviewResponded: "hr.talent.rss.interview.responded",
  interviewRescheduleRequested:
    "hr.talent.rss.interview.reschedule_requested",
  assessmentAccessed: "hr.talent.rss.assessment.accessed",
  preEmploymentFormSubmitted: "hr.talent.rss.form.submitted",
  offerResponded: "hr.talent.rss.offer.responded",
  internalApplicationSubmitted:
    "hr.talent.rss.internal_application.submitted",
  requisitionRequestSubmitted:
    "hr.talent.rss.requisition_request.submitted",
  candidateReviewed: "hr.talent.rss.candidate_review.updated",
  scorecardSubmitted: "hr.talent.rss.scorecard.submitted",
  approvalDecided: "hr.talent.rss.approval.decided",
  taskUpdated: "hr.talent.rss.role_task.updated",
  notificationSent: "hr.talent.rss.notification.sent",
  privacyAccessLogged: "hr.talent.rss.privacy.access_logged",
  consentCaptured: "hr.talent.rss.consent.captured",
  retentionActionRecorded: "hr.talent.rss.retention.action_recorded",
  accountClosureRequested: "hr.talent.rss.account.closure_requested",
  integrationExposed: "hr.talent.rss.integration.exposed",
} as const;

export type HrTalentRssAuditAction =
  (typeof hrTalentRssAuditActions)[keyof typeof hrTalentRssAuditActions];
