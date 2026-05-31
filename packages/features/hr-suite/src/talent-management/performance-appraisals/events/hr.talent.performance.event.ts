export const hrTalentPerformanceAuditActions = {
  cycle: {
    create: "hr.performance.cycle.create",
    update: "hr.performance.cycle.update",
    assignEligible: "hr.performance.cycle.assign_eligible",
  },
  goal: {
    create: "hr.performance.goal.create",
    approve: "hr.performance.goal.approve",
    progressUpdate: "hr.performance.goal.progress_update",
  },
  selfAssessment: {
    submit: "hr.performance.self_assessment.submit",
  },
  managerEvaluation: {
    submit: "hr.performance.manager_evaluation.submit",
    ratingChange: "hr.performance.manager_evaluation.rating_change",
  },
  approval: {
    submit: "hr.performance.approval.submit",
    return: "hr.performance.approval.return",
    approve: "hr.performance.approval.approve",
    hrReview: "hr.performance.approval.hr_review",
  },
  acknowledgment: {
    record: "hr.performance.acknowledgment.record",
  },
  calibration: {
    reference: "hr.performance.calibration.reference",
  },
  outcome: {
    expose: "hr.performance.outcome.expose",
    finalize: "hr.performance.outcome.finalize",
  },
  notification: {
    send: "hr.performance.notification.send",
  },
  report: {
    generate: "hr.performance.report.generate",
  },
} as const;

export type HrTalentPerformanceAuditAction =
  | (typeof hrTalentPerformanceAuditActions.cycle)[keyof typeof hrTalentPerformanceAuditActions.cycle]
  | (typeof hrTalentPerformanceAuditActions.goal)[keyof typeof hrTalentPerformanceAuditActions.goal]
  | (typeof hrTalentPerformanceAuditActions.selfAssessment)[keyof typeof hrTalentPerformanceAuditActions.selfAssessment]
  | (typeof hrTalentPerformanceAuditActions.managerEvaluation)[keyof typeof hrTalentPerformanceAuditActions.managerEvaluation]
  | (typeof hrTalentPerformanceAuditActions.approval)[keyof typeof hrTalentPerformanceAuditActions.approval]
  | (typeof hrTalentPerformanceAuditActions.acknowledgment)[keyof typeof hrTalentPerformanceAuditActions.acknowledgment]
  | (typeof hrTalentPerformanceAuditActions.calibration)[keyof typeof hrTalentPerformanceAuditActions.calibration]
  | (typeof hrTalentPerformanceAuditActions.outcome)[keyof typeof hrTalentPerformanceAuditActions.outcome]
  | (typeof hrTalentPerformanceAuditActions.notification)[keyof typeof hrTalentPerformanceAuditActions.notification]
  | (typeof hrTalentPerformanceAuditActions.report)[keyof typeof hrTalentPerformanceAuditActions.report];
