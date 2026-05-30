/** Audit action strings for FWA execution events (HRM-FWA-032). */
export const hrTimeFwaAuditActions = {
  requestSubmitted: "hr.fwa.request.submitted",
  eligibilityValidated: "hr.fwa.eligibility.validated",
  eligibilityFailed: "hr.fwa.eligibility.failed",
  approved: "hr.fwa.request.approved",
  rejected: "hr.fwa.request.rejected",
  returned: "hr.fwa.request.returned",
  renewed: "hr.fwa.arrangement.renewed",
  suspended: "hr.fwa.arrangement.suspended",
  terminated: "hr.fwa.arrangement.terminated",
  exceptionApproved: "hr.fwa.exception.approved",
  complianceBreach: "hr.fwa.compliance.breach",
  scheduleUpdated: "hr.fwa.schedule.updated",
  payrollReference: "hr.fwa.payroll.reference",
  reviewRecorded: "hr.fwa.review.recorded",
  notificationEnqueued: "hr.fwa.notification.enqueued",
} as const;

export type HrTimeFwaAuditAction =
  (typeof hrTimeFwaAuditActions)[keyof typeof hrTimeFwaAuditActions];

export const HR_FWA_AUDIT_MODULE_KEY = "hr.fwa";
