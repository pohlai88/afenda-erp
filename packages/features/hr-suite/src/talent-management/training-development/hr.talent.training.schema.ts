import { z } from "zod";

import {
  HR_TRAINING_ALERT_AUDIENCES,
  HR_TRAINING_ALERT_STATUSES,
  HR_TRAINING_ASSESSMENT_RESULTS,
  HR_TRAINING_ASSIGNMENT_STATUSES,
  HR_TRAINING_ATTENDANCE_STATUSES,
  HR_TRAINING_CERTIFICATION_STATUSES,
  HR_TRAINING_COMPETENCY_CATEGORIES,
  HR_TRAINING_COMPLETION_STATUSES,
  HR_TRAINING_COURSE_STATUSES,
  HR_TRAINING_DELIVERY_MODES,
  HR_TRAINING_DEVELOPMENT_PLAN_STATUSES,
  HR_TRAINING_ENROLLMENT_STATUSES,
  HR_TRAINING_GAP_SEVERITIES,
  HR_TRAINING_GAP_STATUSES,
  HR_TRAINING_PROFICIENCY_LEVELS,
  HR_TRAINING_PROVIDER_TYPES,
  HR_TRAINING_REQUIREMENT_SCOPE_KINDS,
  HR_TRAINING_TYPES,
} from "./hr.talent.training-constants.shared";

const idSchema = z.string().trim().min(1);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}/);

export const hrTrainingProviderSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  name: idSchema,
  providerType: z.enum(HR_TRAINING_PROVIDER_TYPES),
  contactName: z.string().trim().min(1),
  accreditationRef: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]),
});

export const hrTrainingCourseSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  code: idSchema,
  title: idSchema,
  trainingType: z.enum(HR_TRAINING_TYPES),
  deliveryMode: z.enum(HR_TRAINING_DELIVERY_MODES),
  status: z.enum(HR_TRAINING_COURSE_STATUSES),
  providerId: idSchema,
  durationHours: z.number().positive(),
  capacity: z.number().int().positive(),
  costAmount: z.number().nonnegative(),
  currency: z.string().length(3),
  location: z.string().trim().min(1),
  trainerName: z.string().trim().min(1),
  prerequisites: z.array(idSchema),
  selfEnrollmentEnabled: z.boolean(),
  approvalRequired: z.boolean(),
  lmsCourseId: idSchema.optional(),
});

export const hrTrainingRequirementSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  courseId: idSchema,
  scopeKind: z.enum(HR_TRAINING_REQUIREMENT_SCOPE_KINDS),
  scopeValue: idSchema,
  mandatory: z.boolean(),
  recurrenceMonths: z.number().int().positive().optional(),
  dueWithinDays: z.number().int().positive(),
});

export const hrTrainingAssignmentSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  courseId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  departmentName: idSchema,
  roleTitle: idSchema,
  managerEmployeeId: idSchema,
  assignedByUserId: idSchema,
  assignmentSource: z.enum(["individual", "bulk", "requirement", "performance"]),
  status: z.enum(HR_TRAINING_ASSIGNMENT_STATUSES),
  assignedAt: dateSchema,
  dueAt: dateSchema,
});

export const hrTrainingEnrollmentSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  courseId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  requestedAt: dateSchema,
  status: z.enum(HR_TRAINING_ENROLLMENT_STATUSES),
  approvalRequired: z.boolean(),
  approvedByUserId: idSchema.optional(),
  approvedAt: dateSchema.optional(),
  waitlistPosition: z.number().int().positive().optional(),
});

export const hrTrainingAttendanceSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  courseId: idSchema,
  sessionDate: dateSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  status: z.enum(HR_TRAINING_ATTENDANCE_STATUSES),
  recordedByUserId: idSchema,
});

export const hrTrainingCompletionSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  courseId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  status: z.enum(HR_TRAINING_COMPLETION_STATUSES),
  completedAt: dateSchema.optional(),
  expiresAt: dateSchema.optional(),
  lmsCompletionRef: idSchema.optional(),
});

export const hrTrainingAssessmentSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  courseId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  assessmentDate: dateSchema,
  score: z.number().min(0).max(100).optional(),
  passingScore: z.number().min(0).max(100),
  result: z.enum(HR_TRAINING_ASSESSMENT_RESULTS),
  assessorUserId: idSchema,
});

export const hrTrainingSkillProfileSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  skillName: idSchema,
  skillCategory: z.enum(HR_TRAINING_COMPETENCY_CATEGORIES),
  proficiencyLevel: z.enum(HR_TRAINING_PROFICIENCY_LEVELS),
  evidenceRef: idSchema.optional(),
  lastAssessedAt: dateSchema,
});

export const hrTrainingCompetencySchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  name: idSchema,
  category: z.enum(HR_TRAINING_COMPETENCY_CATEGORIES),
  requiredLevel: z.enum(HR_TRAINING_PROFICIENCY_LEVELS),
  roleTitle: idSchema,
  departmentName: idSchema,
  grade: idSchema,
});

export const hrTrainingSkillGapSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  competencyId: idSchema,
  competencyName: idSchema,
  requiredLevel: z.enum(HR_TRAINING_PROFICIENCY_LEVELS),
  currentLevel: z.enum(HR_TRAINING_PROFICIENCY_LEVELS),
  severity: z.enum(HR_TRAINING_GAP_SEVERITIES),
  status: z.enum(HR_TRAINING_GAP_STATUSES),
  sourceRef: idSchema,
});

export const hrTrainingDevelopmentPlanSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  title: idSchema,
  source: z.enum(["skill_gap", "manager_recommendation", "performance_review"]),
  courseId: idSchema.optional(),
  skillGapId: idSchema.optional(),
  performanceReviewRef: idSchema.optional(),
  targetDate: dateSchema,
  status: z.enum(HR_TRAINING_DEVELOPMENT_PLAN_STATUSES),
  progressPercent: z.number().min(0).max(100),
});

export const hrTrainingCertificationSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  certificationName: idSchema,
  issuingBody: idSchema,
  issueDate: dateSchema.optional(),
  expiryDate: dateSchema.optional(),
  renewalDate: dateSchema.optional(),
  certificateReference: idSchema.optional(),
  documentEvidenceRef: idSchema.optional(),
  required: z.boolean(),
  status: z.enum(HR_TRAINING_CERTIFICATION_STATUSES),
});

export const hrTrainingCertificationAlertSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  certificationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  audience: z.enum(HR_TRAINING_ALERT_AUDIENCES),
  status: z.enum(HR_TRAINING_ALERT_STATUSES),
  alertAt: dateSchema,
  severity: z.enum(HR_TRAINING_GAP_SEVERITIES),
  message: idSchema,
});

export const hrTrainingFeedbackSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  courseId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  submittedAt: dateSchema,
  rating: z.number().int().min(1).max(5),
  comments: z.string().trim().min(1),
});

export const hrTrainingCostSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  courseId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  departmentName: idSchema,
  providerId: idSchema,
  period: idSchema,
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
});

export type HrTrainingProviderInput = z.infer<typeof hrTrainingProviderSchema>;
export type HrTrainingCourseInput = z.infer<typeof hrTrainingCourseSchema>;
export type HrTrainingRequirementInput = z.infer<
  typeof hrTrainingRequirementSchema
>;
export type HrTrainingAssignmentInput = z.infer<
  typeof hrTrainingAssignmentSchema
>;
export type HrTrainingEnrollmentInput = z.infer<
  typeof hrTrainingEnrollmentSchema
>;
export type HrTrainingAttendanceInput = z.infer<
  typeof hrTrainingAttendanceSchema
>;
export type HrTrainingCompletionInput = z.infer<
  typeof hrTrainingCompletionSchema
>;
export type HrTrainingAssessmentInput = z.infer<
  typeof hrTrainingAssessmentSchema
>;
export type HrTrainingSkillProfileInput = z.infer<
  typeof hrTrainingSkillProfileSchema
>;
export type HrTrainingCompetencyInput = z.infer<
  typeof hrTrainingCompetencySchema
>;
export type HrTrainingSkillGapInput = z.infer<typeof hrTrainingSkillGapSchema>;
export type HrTrainingDevelopmentPlanInput = z.infer<
  typeof hrTrainingDevelopmentPlanSchema
>;
export type HrTrainingCertificationInput = z.infer<
  typeof hrTrainingCertificationSchema
>;
export type HrTrainingCertificationAlertInput = z.infer<
  typeof hrTrainingCertificationAlertSchema
>;
export type HrTrainingFeedbackInput = z.infer<typeof hrTrainingFeedbackSchema>;
export type HrTrainingCostInput = z.infer<typeof hrTrainingCostSchema>;
