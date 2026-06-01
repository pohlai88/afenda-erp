import { z } from "zod";

import {
  HR_GPG_ASSIGNMENT_VALIDATION_STATUSES,
  HR_GPG_CLASSIFICATION_REFERENCE_TYPES,
  HR_GPG_CLASSIFICATION_REVIEW_STATUSES,
  HR_GPG_CLASSIFICATION_REVIEW_TYPES,
  HR_GPG_CLASSIFICATION_STATUSES,
  HR_GPG_GRADE_MOVEMENT_STATUSES,
  HR_GPG_GRADE_MOVEMENT_TYPES,
  HR_GPG_INTEGRATION_TARGETS,
  HR_GPG_LOCALITY_ADJUSTMENT_TYPES,
  HR_GPG_PAY_GRADE_STATUSES,
  HR_GPG_SALARY_TABLE_STATUSES,
  HR_GPG_STEP_ELIGIBILITY_STATUSES,
  HR_GPG_STEP_PROCESSING_MODES,
} from "./hr.industry.gpg-constants.shared";

const idSchema = z.string().trim().min(1);
const optionalIdSchema = z.string().trim().min(1).optional();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}/);
const dateTimeSchema = z.string().datetime().or(dateSchema);
const moneySchema = z.number().finite().nonnegative();

export const hrGpgClassificationStructureSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  classificationCode: idSchema,
  classificationName: idSchema,
  occupationalGroup: idSchema,
  jobSeries: idSchema,
  serviceScheme: idSchema,
  jobFamily: idSchema,
  agency: idSchema,
  department: idSchema,
  positionTitle: idSchema,
  referenceType: z.enum(HR_GPG_CLASSIFICATION_REFERENCE_TYPES),
  referenceCode: idSchema,
  status: z.enum(HR_GPG_CLASSIFICATION_STATUSES),
  effectiveFrom: dateSchema,
});

export const hrGpgPayGradeSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  gradeCode: idSchema,
  gradeName: idSchema,
  payBandCode: idSchema,
  rankReference: optionalIdSchema,
  minSalary: moneySchema,
  maxSalary: moneySchema,
  stepCount: z.number().int().min(1).max(30),
  status: z.enum(HR_GPG_PAY_GRADE_STATUSES),
  effectiveFrom: dateSchema,
});

export const hrGpgSalaryTableVersionSchema = z
  .object({
    id: idSchema,
    organizationId: idSchema,
    salaryTableCode: idSchema,
    version: idSchema,
    gradeCode: idSchema,
    stepCode: idSchema,
    baseRate: moneySchema,
    minSalary: moneySchema,
    maxSalary: moneySchema,
    currency: z.string().trim().length(3),
    effectiveFrom: dateSchema,
    effectiveTo: dateSchema.optional(),
    status: z.enum(HR_GPG_SALARY_TABLE_STATUSES),
    approvedBy: optionalIdSchema,
  })
  .superRefine((value, context) => {
    if (value.minSalary > value.maxSalary) {
      context.addIssue({
        code: "custom",
        message: "Minimum salary must not exceed maximum salary.",
        path: ["minSalary"],
      });
    }
    if (value.baseRate < value.minSalary || value.baseRate > value.maxSalary) {
      context.addIssue({
        code: "custom",
        message: "Base rate must sit within the salary range.",
        path: ["baseRate"],
      });
    }
  });

export const hrGpgLocalityAdjustmentRuleSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  localityArea: idSchema,
  region: idSchema,
  country: idSchema,
  city: idSchema,
  dutyStation: idSchema,
  workLocation: idSchema,
  adjustmentType: z.enum(HR_GPG_LOCALITY_ADJUSTMENT_TYPES),
  adjustmentRate: z.number().finite().min(0).max(100),
  allowanceRef: optionalIdSchema,
  status: z.enum(["draft", "active", "retired"]),
  effectiveFrom: dateSchema,
});

export const hrGpgPositionAssignmentSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  positionId: idSchema,
  positionTitle: idSchema,
  classificationCode: idSchema,
  gradeCode: idSchema,
  payBandCode: idSchema,
  stepCode: idSchema,
  salaryTableCode: idSchema,
  localityArea: idSchema,
  appointmentType: idSchema,
  employeeCategory: idSchema,
  policyGroup: idSchema,
  agency: idSchema,
  department: idSchema,
  effectiveFrom: dateSchema,
  validationStatus: z.enum(HR_GPG_ASSIGNMENT_VALIDATION_STATUSES),
  validationMessage: idSchema,
  currentBasePay: moneySchema,
  localityAdjustedPay: moneySchema,
});

export const hrGpgStepEligibilityRuleSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  gradeCode: idSchema,
  stepCode: idSchema,
  nextStepCode: idSchema,
  appointmentType: idSchema,
  waitingPeriodMonths: z.number().int().min(1).max(120),
  performanceReference: idSchema,
  processingMode: z.enum(HR_GPG_STEP_PROCESSING_MODES),
  status: z.enum(["draft", "active", "retired"]),
  effectiveFrom: dateSchema,
});

export const hrGpgStepIncreaseCandidateSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  gradeCode: idSchema,
  currentStepCode: idSchema,
  nextStepCode: idSchema,
  serviceMonths: z.number().int().min(0).max(600),
  appointmentType: idSchema,
  performanceReference: idSchema,
  eligibilityDate: dateSchema,
  eligibilityStatus: z.enum(HR_GPG_STEP_ELIGIBILITY_STATUSES),
  processingMode: z.enum(HR_GPG_STEP_PROCESSING_MODES),
  approvalRef: optionalIdSchema,
});

export const hrGpgGradeMovementSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  movementType: z.enum(HR_GPG_GRADE_MOVEMENT_TYPES),
  fromClassificationCode: idSchema,
  fromGradeCode: idSchema,
  fromStepCode: idSchema,
  toClassificationCode: idSchema,
  toGradeCode: idSchema,
  toStepCode: idSchema,
  effectiveDate: dateSchema,
  reason: idSchema,
  status: z.enum(HR_GPG_GRADE_MOVEMENT_STATUSES),
  retentionRef: optionalIdSchema,
  lifecycleRef: optionalIdSchema,
});

export const hrGpgClassificationReviewSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  classificationCode: idSchema,
  positionId: idSchema,
  requestedBy: idSchema,
  reviewType: z.enum(HR_GPG_CLASSIFICATION_REVIEW_TYPES),
  status: z.enum(HR_GPG_CLASSIFICATION_REVIEW_STATUSES),
  effectiveDate: dateSchema,
  outcomeRef: optionalIdSchema,
});

export const hrGpgIntegrationExposureSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  integrationTarget: z.enum(HR_GPG_INTEGRATION_TARGETS),
  sourceRef: idSchema,
  approvedReference: idSchema,
  status: z.enum(["ready", "exposed", "blocked"]),
  exposedAt: dateTimeSchema,
});

export type HrGpgClassificationStructureInput = z.infer<
  typeof hrGpgClassificationStructureSchema
>;
export type HrGpgPayGradeInput = z.infer<typeof hrGpgPayGradeSchema>;
export type HrGpgSalaryTableVersionInput = z.infer<
  typeof hrGpgSalaryTableVersionSchema
>;
export type HrGpgLocalityAdjustmentRuleInput = z.infer<
  typeof hrGpgLocalityAdjustmentRuleSchema
>;
export type HrGpgPositionAssignmentInput = z.infer<
  typeof hrGpgPositionAssignmentSchema
>;
export type HrGpgStepEligibilityRuleInput = z.infer<
  typeof hrGpgStepEligibilityRuleSchema
>;
export type HrGpgStepIncreaseCandidateInput = z.infer<
  typeof hrGpgStepIncreaseCandidateSchema
>;
export type HrGpgGradeMovementInput = z.infer<typeof hrGpgGradeMovementSchema>;
export type HrGpgClassificationReviewInput = z.infer<
  typeof hrGpgClassificationReviewSchema
>;
export type HrGpgIntegrationExposureInput = z.infer<
  typeof hrGpgIntegrationExposureSchema
>;

export const hrIndustryGpgListRowSchema = z.object({
  id: idSchema,
  cells: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
  ),
  rowHref: z.string().optional(),
  rowTone: z.enum(["attention", "critical"]).optional(),
});

export type HrIndustryGpgListRowInput = z.infer<
  typeof hrIndustryGpgListRowSchema
>;
