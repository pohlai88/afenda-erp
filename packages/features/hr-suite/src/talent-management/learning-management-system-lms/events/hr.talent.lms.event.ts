export const hrTalentLmsAuditActions = {
  courseSetup: "hr.lms.course.setup",
  learningPathSetup: "hr.lms.learning_path.setup",
  assignment: "hr.lms.assignment.create",
  enrollment: "hr.lms.enrollment.create",
  progressUpdate: "hr.lms.progress.update",
  assessment: "hr.lms.assessment.submit",
  completion: "hr.lms.completion.record",
  failure: "hr.lms.completion.fail",
  certification: "hr.lms.certification.issue",
  renewal: "hr.lms.certification.renew",
  reminder: "hr.lms.reminder.send",
  reportExport: "hr.lms.report.export",
} as const;

export type HrTalentLmsAuditAction =
  (typeof hrTalentLmsAuditActions)[keyof typeof hrTalentLmsAuditActions];
