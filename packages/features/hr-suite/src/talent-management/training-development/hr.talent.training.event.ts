export const hrTrainingAuditActions = {
  courseCreated: "hr.training.course.created",
  courseUpdated: "hr.training.course.updated",
  requirementDefined: "hr.training.requirement.defined",
  assignmentCreated: "hr.training.assignment.created",
  enrollmentRequested: "hr.training.enrollment.requested",
  enrollmentApproved: "hr.training.enrollment.approved",
  waitlistChanged: "hr.training.waitlist.changed",
  attendanceRecorded: "hr.training.attendance.recorded",
  completionRecorded: "hr.training.completion.recorded",
  assessmentRecorded: "hr.training.assessment.recorded",
  certificationRecorded: "hr.training.certification.recorded",
  certificationRenewed: "hr.training.certification.renewed",
  certificationExpired: "hr.training.certification.expired",
  feedbackSubmitted: "hr.training.feedback.submitted",
  costRecorded: "hr.training.cost.recorded",
  developmentPlanCreated: "hr.training.development-plan.created",
  complianceExported: "hr.training.integration.compliance-exported",
  readinessExposed: "hr.training.integration.readiness-exposed",
} as const;

export const hrTalentTrainingAuditActions = hrTrainingAuditActions;

export type HrTrainingAuditAction =
  (typeof hrTrainingAuditActions)[keyof typeof hrTrainingAuditActions];

export type HrTalentTrainingAuditAction = HrTrainingAuditAction;
