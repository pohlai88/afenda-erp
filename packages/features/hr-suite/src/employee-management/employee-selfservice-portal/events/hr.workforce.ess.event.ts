export const hrWorkforceEssAuditActions = {
  portalViewed: "hr.workforce.ess.portal.viewed",
  profileViewed: "hr.workforce.ess.profile.viewed",
  profileUpdateRequested: "hr.workforce.ess.profile-update.requested",
  profileUpdateDecided: "hr.workforce.ess.profile-update.decided",
  leaveRequested: "hr.workforce.ess.leave.requested",
  leaveAmended: "hr.workforce.ess.leave.amended",
  leaveCancelled: "hr.workforce.ess.leave.cancelled",
  payDocumentAccessed: "hr.workforce.ess.pay-document.accessed",
  documentAccessed: "hr.workforce.ess.document.accessed",
  attendanceViewed: "hr.workforce.ess.attendance.viewed",
  claimSubmitted: "hr.workforce.ess.claim.submitted",
  supportingDocumentUploaded: "hr.workforce.ess.document.uploaded",
  resourceAccessed: "hr.workforce.ess.resource.accessed",
  policyAcknowledged: "hr.workforce.ess.policy.acknowledged",
  taskCompleted: "hr.workforce.ess.task.completed",
  approvalDecided: "hr.workforce.ess.approval.decided",
  notificationRead: "hr.workforce.ess.notification.read",
  consentCaptured: "hr.workforce.ess.consent.captured",
  integrationExposed: "hr.workforce.ess.integration.exposed",
} as const;

export type HrWorkforceEssAuditAction =
  (typeof hrWorkforceEssAuditActions)[keyof typeof hrWorkforceEssAuditActions];
