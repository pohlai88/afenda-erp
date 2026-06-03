import { z } from "zod";

import {
  HR_SUCCESSION_BUSINESS_IMPACTS,
  HR_SUCCESSION_CALIBRATION_OUTCOMES,
  HR_SUCCESSION_CALIBRATION_REVIEWERS,
  HR_SUCCESSION_DEVELOPMENT_ACTION_KINDS,
  HR_SUCCESSION_DEVELOPMENT_STATUSES,
  HR_SUCCESSION_LEADERSHIP_LEVELS,
  HR_SUCCESSION_NOTIFICATION_TYPES,
  HR_SUCCESSION_PERFORMANCE_GRID_CELLS,
  HR_SUCCESSION_POTENTIAL_LEVELS,
  HR_SUCCESSION_READINESS_LEVELS,
  HR_SUCCESSION_RECOMMENDATION_MOVEMENT_TYPES,
  HR_SUCCESSION_REPLACEMENT_DIFFICULTIES,
  HR_SUCCESSION_REPLACEMENT_PLAN_TYPES,
  HR_SUCCESSION_REPORT_GROUP_BY,
  HR_SUCCESSION_RETENTION_RISKS,
  HR_SUCCESSION_RISK_LEVELS,
  HR_SUCCESSION_SUCCESSOR_TYPES,
  HR_SUCCESSION_TALENT_POOL_TYPES,
  HR_SUCCESSION_VACANCY_RISKS,
} from "./hr.talent.succession-constants.shared";

const nonEmptyString = z.string().trim().min(1);
const optionalStringArray = z.array(nonEmptyString).default([]);

export const hrSuccessionCriticalRoleSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  roleCode: nonEmptyString,
  roleTitle: nonEmptyString,
  orgUnitId: nonEmptyString,
  orgUnitName: nonEmptyString,
  departmentId: nonEmptyString,
  departmentName: nonEmptyString,
  legalEntityCode: nonEmptyString,
  positionId: nonEmptyString,
  jobFamily: nonEmptyString,
  grade: nonEmptyString,
  incumbentEmployeeId: nonEmptyString.nullable().default(null),
  incumbentDisplayName: nonEmptyString.nullable().default(null),
  businessImpact: z.enum(HR_SUCCESSION_BUSINESS_IMPACTS),
  leadershipLevel: z.enum(HR_SUCCESSION_LEADERSHIP_LEVELS),
  vacancyRisk: z.enum(HR_SUCCESSION_VACANCY_RISKS),
  replacementDifficulty: z.enum(HR_SUCCESSION_REPLACEMENT_DIFFICULTIES),
  reviewCycleId: nonEmptyString,
  nextReviewDueAt: z.iso.date(),
  active: z.boolean().default(true),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const hrSuccessionPerformanceReferenceSchema = z.object({
  appraisalId: nonEmptyString,
  reviewCycleId: nonEmptyString,
  reviewPeriod: nonEmptyString,
  finalRatingLabel: nonEmptyString,
  performanceOutcomeCode: nonEmptyString,
  managerRecommendationKinds: optionalStringArray,
});

export const hrSuccessionPotentialAssessmentSchema = z.object({
  potentialLevel: z.enum(HR_SUCCESSION_POTENTIAL_LEVELS),
  leadershipPotentialScore: z.number().min(0).max(100),
  learningAgilityScore: z.number().min(0).max(100),
  businessImpactScore: z.number().min(0).max(100),
  growthCapacityScore: z.number().min(0).max(100),
  assessedByUserId: nonEmptyString,
  assessedAt: z.iso.datetime(),
});

export const hrSuccessionSuccessorNominationSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  criticalRoleId: nonEmptyString,
  employeeId: nonEmptyString,
  employeeDisplayName: nonEmptyString,
  currentRoleTitle: nonEmptyString,
  managerEmployeeId: nonEmptyString,
  successorType: z.enum(HR_SUCCESSION_SUCCESSOR_TYPES),
  readinessLevel: z.enum(HR_SUCCESSION_READINESS_LEVELS),
  readinessScore: z.number().min(0).max(100),
  readinessAssessedAt: z.iso.datetime(),
  performanceReference: hrSuccessionPerformanceReferenceSchema.nullable().default(null),
  potentialAssessment: hrSuccessionPotentialAssessmentSchema,
  gridEnabled: z.boolean().default(true),
  gridCell: z.enum(HR_SUCCESSION_PERFORMANCE_GRID_CELLS).nullable().default(null),
  retentionRisk: z.enum(HR_SUCCESSION_RETENTION_RISKS),
  competencyGapIds: optionalStringArray,
  developmentPlanId: nonEmptyString.nullable().default(null),
  nominatedByUserId: nonEmptyString,
  nominatedAt: z.iso.datetime(),
  approvedAt: z.iso.datetime().nullable().default(null),
});

export const hrSuccessionCompetencyGapSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  criticalRoleId: nonEmptyString,
  successorNominationId: nonEmptyString,
  employeeId: nonEmptyString,
  employeeDisplayName: nonEmptyString,
  competencyCode: nonEmptyString,
  competencyName: nonEmptyString,
  requiredLevel: nonEmptyString,
  currentLevel: nonEmptyString,
  severity: z.enum(["critical", "high", "medium", "low"]),
  developmentPriority: z.number().int().min(1).max(5),
  recommendedActions: optionalStringArray,
});

export const hrSuccessionDevelopmentActionSchema = z.object({
  id: nonEmptyString,
  kind: z.enum(HR_SUCCESSION_DEVELOPMENT_ACTION_KINDS),
  title: nonEmptyString,
  ownerUserId: nonEmptyString,
  dueDate: z.iso.date(),
  progressPercent: z.number().min(0).max(100),
  status: z.enum(HR_SUCCESSION_DEVELOPMENT_STATUSES),
  linkedLearningRef: nonEmptyString.nullable().default(null),
});

export const hrSuccessionDevelopmentPlanSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  successorNominationId: nonEmptyString,
  employeeId: nonEmptyString,
  employeeDisplayName: nonEmptyString,
  targetRoleId: nonEmptyString,
  targetRoleTitle: nonEmptyString,
  planCode: nonEmptyString,
  planTitle: nonEmptyString,
  status: z.enum(HR_SUCCESSION_DEVELOPMENT_STATUSES),
  progressPercent: z.number().min(0).max(100),
  actions: z.array(hrSuccessionDevelopmentActionSchema).min(1),
  careerPathReferenceId: nonEmptyString.nullable().default(null),
  updatedAt: z.iso.datetime(),
});

export const hrSuccessionTalentPoolMemberSchema = z.object({
  employeeId: nonEmptyString,
  employeeDisplayName: nonEmptyString,
  readinessLevel: z.enum(HR_SUCCESSION_READINESS_LEVELS),
  potentialLevel: z.enum(HR_SUCCESSION_POTENTIAL_LEVELS),
  jobFamily: nonEmptyString,
  leadershipLevel: z.enum(HR_SUCCESSION_LEADERSHIP_LEVELS),
});

export const hrSuccessionTalentPoolSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  name: nonEmptyString,
  poolType: z.enum(HR_SUCCESSION_TALENT_POOL_TYPES),
  ownerUserId: nonEmptyString,
  reviewCycleId: nonEmptyString,
  members: z.array(hrSuccessionTalentPoolMemberSchema).default([]),
  fairnessReviewRef: nonEmptyString.nullable().default(null),
  biasRiskIndicator: z.enum(HR_SUCCESSION_RISK_LEVELS),
  updatedAt: z.iso.datetime(),
});

export const hrSuccessionCalibrationReviewSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  reviewCycleId: nonEmptyString,
  criticalRoleId: nonEmptyString,
  successorNominationId: nonEmptyString,
  reviewerRole: z.enum(HR_SUCCESSION_CALIBRATION_REVIEWERS),
  outcome: z.enum(HR_SUCCESSION_CALIBRATION_OUTCOMES),
  comments: nonEmptyString,
  decisionReference: nonEmptyString,
  reviewedByUserId: nonEmptyString,
  reviewedAt: z.iso.datetime(),
});

export const hrSuccessionReplacementPlanSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  criticalRoleId: nonEmptyString,
  planType: z.enum(HR_SUCCESSION_REPLACEMENT_PLAN_TYPES),
  successorNominationId: nonEmptyString.nullable().default(null),
  interimOwnerEmployeeId: nonEmptyString.nullable().default(null),
  plannedEffectiveDate: z.iso.date().nullable().default(null),
  contingencyNotes: nonEmptyString,
  approvedAt: z.iso.datetime().nullable().default(null),
});

export const hrSuccessionReviewCycleSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  name: nonEmptyString,
  periodStart: z.iso.date(),
  periodEnd: z.iso.date(),
  status: z.enum(["scheduled", "in_review", "approved", "closed"]),
  nextReviewDueAt: z.iso.date(),
});

export const hrSuccessionNotificationSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  criticalRoleId: nonEmptyString,
  type: z.enum(HR_SUCCESSION_NOTIFICATION_TYPES),
  title: nonEmptyString,
  recipientRole: z.enum(["hr", "manager", "leader"]),
  recipientId: nonEmptyString,
  severity: z.enum(HR_SUCCESSION_RISK_LEVELS),
  dueDate: z.iso.date(),
  sentAt: z.iso.datetime(),
});

export const hrSuccessionLifecycleRecommendationSchema = z.object({
  id: nonEmptyString,
  organizationId: nonEmptyString,
  criticalRoleId: nonEmptyString,
  successorNominationId: nonEmptyString,
  employeeId: nonEmptyString,
  employeeDisplayName: nonEmptyString,
  targetRoleTitle: nonEmptyString,
  movementType: z.enum(HR_SUCCESSION_RECOMMENDATION_MOVEMENT_TYPES),
  approvalReference: nonEmptyString,
  lifecycleReference: nonEmptyString.nullable().default(null),
  approvedAt: z.iso.datetime(),
});

export const hrSuccessionReportFilterSchema = z.object({
  groupBy: z.enum(HR_SUCCESSION_REPORT_GROUP_BY).default("department"),
});

export type HrSuccessionCriticalRoleInput = z.infer<
  typeof hrSuccessionCriticalRoleSchema
>;
export type HrSuccessionSuccessorNominationInput = z.infer<
  typeof hrSuccessionSuccessorNominationSchema
>;
export type HrSuccessionPerformanceReferenceInput = z.infer<
  typeof hrSuccessionPerformanceReferenceSchema
>;
export type HrSuccessionPotentialAssessmentInput = z.infer<
  typeof hrSuccessionPotentialAssessmentSchema
>;
export type HrSuccessionCompetencyGapInput = z.infer<
  typeof hrSuccessionCompetencyGapSchema
>;
export type HrSuccessionDevelopmentActionInput = z.infer<
  typeof hrSuccessionDevelopmentActionSchema
>;
export type HrSuccessionDevelopmentPlanInput = z.infer<
  typeof hrSuccessionDevelopmentPlanSchema
>;
export type HrSuccessionTalentPoolInput = z.infer<
  typeof hrSuccessionTalentPoolSchema
>;
export type HrSuccessionCalibrationReviewInput = z.infer<
  typeof hrSuccessionCalibrationReviewSchema
>;
export type HrSuccessionReplacementPlanInput = z.infer<
  typeof hrSuccessionReplacementPlanSchema
>;
export type HrSuccessionReviewCycleInput = z.infer<
  typeof hrSuccessionReviewCycleSchema
>;
export type HrSuccessionNotificationInput = z.infer<
  typeof hrSuccessionNotificationSchema
>;
export type HrSuccessionLifecycleRecommendationInput = z.infer<
  typeof hrSuccessionLifecycleRecommendationSchema
>;
export type HrSuccessionReportFilterInput = z.infer<
  typeof hrSuccessionReportFilterSchema
>;
