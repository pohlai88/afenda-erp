export const hrIndustryGpgAuditActions = {
  classificationConfigured: "hr.industry.gpg.classification.configured",
  payGradeConfigured: "hr.industry.gpg.pay_grade.configured",
  salaryTablePublished: "hr.industry.gpg.salary_table.published",
  localityAdjustmentConfigured:
    "hr.industry.gpg.locality_adjustment.configured",
  positionAssigned: "hr.industry.gpg.position.assigned",
  assignmentValidated: "hr.industry.gpg.assignment.validated",
  assignmentBlocked: "hr.industry.gpg.assignment.blocked",
  stepEligibilityCalculated: "hr.industry.gpg.step.eligibility_calculated",
  stepIncreaseProcessed: "hr.industry.gpg.step.increase_processed",
  promotionProcessed: "hr.industry.gpg.grade_movement.promotion_processed",
  reclassificationProcessed:
    "hr.industry.gpg.grade_movement.reclassification_processed",
  downgradeRecorded: "hr.industry.gpg.grade_movement.downgrade_recorded",
  retentionRecorded: "hr.industry.gpg.retention.recorded",
  actingGradeRecorded: "hr.industry.gpg.acting_grade.recorded",
  classificationReviewRecorded:
    "hr.industry.gpg.classification_review.recorded",
  payrollReferenceExposed: "hr.industry.gpg.payroll_reference.exposed",
  lifecycleReferenceExposed: "hr.industry.gpg.lifecycle_reference.exposed",
} as const;

export type HrIndustryGpgAuditAction =
  (typeof hrIndustryGpgAuditActions)[keyof typeof hrIndustryGpgAuditActions];
