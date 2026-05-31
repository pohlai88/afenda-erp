import { z } from "zod";

import {
  HR_PER_ACCESS_ROLES,
  HR_PER_APPROVAL_ROLES,
  HR_PER_GOAL_STATUSES,
  HR_PER_MANDATORY_SECTIONS,
  HR_PER_NOTIFICATION_EVENTS,
  HR_PER_RECOMMENDATION_TYPES,
  HR_PER_REPORT_GROUP_BY,
  HR_PER_REVIEW_STATUSES,
  HR_PER_REVIEW_TYPES,
} from "./hr.talent.performance-constants.shared";

const nonEmptyString = z.string().trim().min(1);
const optionalScopeValues = z.array(nonEmptyString).default([]);

export const hrPerEligibilityRuleSchema = z.object({
  employmentStatuses: optionalScopeValues,
  minTenureDays: z.number().int().min(0).default(0),
  departmentIds: optionalScopeValues,
  grades: optionalScopeValues,
  roleIds: optionalScopeValues,
  legalEntityCodes: optionalScopeValues,
  employeeCategories: optionalScopeValues,
});

export const hrPerCycleSchema = z
  .object({
    id: nonEmptyString,
    organizationId: nonEmptyString,
    name: nonEmptyString,
    reviewType: z.enum(HR_PER_REVIEW_TYPES),
    periodStart: z.iso.date(),
    periodEnd: z.iso.date(),
    reviewStartDate: z.iso.date(),
    submissionDeadline: z.iso.date(),
    approvalDeadline: z.iso.date(),
    finalizationDate: z.iso.date(),
    status: z.enum(HR_PER_REVIEW_STATUSES).default("draft"),
    eligibility: hrPerEligibilityRuleSchema,
    ratingScaleId: nonEmptyString,
    requiresGoalApproval: z.boolean().default(true),
    requiresHrReview: z.boolean().default(false),
    calibrationEnabled: z.boolean().default(false),
    weightedScoringEnabled: z.boolean().default(true),
    mandatorySections: z.array(z.enum(HR_PER_MANDATORY_SECTIONS)).default([
      "goals",
      "self_assessment",
      "manager_evaluation",
    ]),
  })
  .superRefine((value, ctx) => {
    const periodStart = Date.parse(value.periodStart);
    const periodEnd = Date.parse(value.periodEnd);
    const reviewStart = Date.parse(value.reviewStartDate);
    const submission = Date.parse(value.submissionDeadline);
    const approval = Date.parse(value.approvalDeadline);
    const finalization = Date.parse(value.finalizationDate);

    if (periodEnd < periodStart) {
      ctx.addIssue({
        code: "custom",
        path: ["periodEnd"],
        message: "Review period end must not be before period start.",
      });
    }
    if (submission < reviewStart) {
      ctx.addIssue({
        code: "custom",
        path: ["submissionDeadline"],
        message: "Submission deadline must not be before review start.",
      });
    }
    if (approval < submission) {
      ctx.addIssue({
        code: "custom",
        path: ["approvalDeadline"],
        message: "Approval deadline must not be before submission deadline.",
      });
    }
    if (finalization < approval) {
      ctx.addIssue({
        code: "custom",
        path: ["finalizationDate"],
        message: "Finalization date must not be before approval deadline.",
      });
    }
  });

export const hrPerEmployeeProfileSchema = z.object({
  employeeId: nonEmptyString,
  employeeDisplayName: nonEmptyString,
  employmentStatus: nonEmptyString,
  hireDate: z.iso.date(),
  departmentId: nonEmptyString,
  departmentName: nonEmptyString,
  grade: nonEmptyString,
  roleId: nonEmptyString,
  legalEntityCode: nonEmptyString,
  employeeCategory: nonEmptyString,
  managerEmployeeId: nonEmptyString.nullable(),
});

export const hrPerReviewAssignmentSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  cycleId: nonEmptyString,
  employeeId: nonEmptyString,
  employeeDisplayName: nonEmptyString,
  managerEmployeeId: nonEmptyString.nullable(),
  managerDisplayName: nonEmptyString.nullable(),
  departmentId: nonEmptyString,
  departmentName: nonEmptyString,
  legalEntityCode: nonEmptyString,
  status: z.enum(HR_PER_REVIEW_STATUSES),
  assignedAt: z.iso.datetime(),
  submittedAt: z.iso.datetime().nullable(),
  finalizedAt: z.iso.datetime().nullable(),
  acknowledgedAt: z.iso.datetime().nullable(),
  lockedAt: z.iso.datetime().nullable(),
});

export const hrPerGoalSchema = z.object({
  id: nonEmptyString,
  reviewId: nonEmptyString,
  employeeId: nonEmptyString,
  title: nonEmptyString,
  target: nonEmptyString,
  weight: z.number().min(0).max(100),
  dueDate: z.iso.date(),
  progressPercent: z.number().min(0).max(100).default(0),
  achievementResult: z.number().min(0).max(200).nullable().default(null),
  status: z.enum(HR_PER_GOAL_STATUSES),
  createdByRole: z.enum(["employee", "manager"]),
  managerApprovedAt: z.iso.datetime().nullable().default(null),
});

export const hrPerSelfAssessmentSchema = z.object({
  reviewId: nonEmptyString,
  selfRating: z.number().min(1).max(5),
  comments: nonEmptyString,
  submittedAt: z.iso.datetime(),
});

export const hrPerManagerEvaluationSchema = z.object({
  reviewId: nonEmptyString,
  managerRating: z.number().min(1).max(5),
  comments: nonEmptyString,
  performanceSummary: nonEmptyString,
  recommendations: z.array(z.enum(HR_PER_RECOMMENDATION_TYPES)).default([]),
  submittedAt: z.iso.datetime(),
});

export const hrPerWeightedAssessmentItemSchema = z.object({
  id: nonEmptyString,
  name: nonEmptyString,
  weight: z.number().min(0).max(100),
  rating: z.number().min(0).max(5),
  comments: z.string().trim().max(1000).optional(),
});

export const hrPerKpiAssessmentItemSchema =
  hrPerWeightedAssessmentItemSchema.extend({
    target: nonEmptyString,
    result: nonEmptyString,
    achievementPercent: z.number().min(0).max(200),
  });

export const hrPerMeetingSchema = z.object({
  reviewId: nonEmptyString,
  discussionDate: z.iso.date(),
  notes: nonEmptyString,
});

export const hrPerOutcomeSchema = z.object({
  reviewId: nonEmptyString,
  finalRating: z.number().min(1).max(5),
  performanceCategory: nonEmptyString,
  promotionRecommended: z.boolean().default(false),
  compensationReviewRecommended: z.boolean().default(false),
  performanceImprovementRequired: z.boolean().default(false),
  developmentActions: z.array(nonEmptyString).default([]),
});

export const hrPerApprovalStepSchema = z.object({
  id: nonEmptyString,
  reviewId: nonEmptyString,
  role: z.enum(HR_PER_APPROVAL_ROLES),
  sequence: z.number().int().min(1),
  status: z.enum(["pending", "approved", "returned", "acknowledged"]),
  required: z.boolean(),
  decidedAt: z.iso.datetime().nullable(),
});

export const hrPerNotificationSchema = z.object({
  id: nonEmptyString,
  reviewId: nonEmptyString,
  event: z.enum(HR_PER_NOTIFICATION_EVENTS),
  recipientRole: z.enum(HR_PER_ACCESS_ROLES),
  recipientId: nonEmptyString,
  sentAt: z.iso.datetime(),
});

export const hrPerReportFilterSchema = z.object({
  employeeId: nonEmptyString.optional(),
  managerEmployeeId: nonEmptyString.optional(),
  departmentId: nonEmptyString.optional(),
  legalEntityCode: nonEmptyString.optional(),
  cycleId: nonEmptyString.optional(),
  rating: z.number().min(1).max(5).optional(),
  completionStatus: z.enum(HR_PER_REVIEW_STATUSES).optional(),
  periodStart: z.iso.date().optional(),
  periodEnd: z.iso.date().optional(),
  groupBy: z.enum(HR_PER_REPORT_GROUP_BY).default("department"),
});

export type HrPerCycleInput = z.infer<typeof hrPerCycleSchema>;
export type HrPerEmployeeProfileInput = z.infer<
  typeof hrPerEmployeeProfileSchema
>;
export type HrPerReviewAssignmentInput = z.infer<
  typeof hrPerReviewAssignmentSchema
>;
export type HrPerGoalInput = z.infer<typeof hrPerGoalSchema>;
export type HrPerReportFilterInput = z.infer<typeof hrPerReportFilterSchema>;
