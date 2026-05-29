import { z } from "zod"

import {
  HRM_LMS_CONTENT_REF_TYPES,
  HRM_LMS_COURSE_TYPES,
  HRM_LMS_PATH_TYPES,
  hrmLmsContentRefTypeSchema,
  hrmLmsCourseTypeSchema,
  hrmLmsPathTypeSchema,
} from "./lms-workflow-state.shared"

const uuid = z.string().uuid()

const courseCode = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .regex(/^[A-Za-z0-9._-]+$/)

export function normalizeLmsCourseCode(value: string): string {
  return value.trim().toUpperCase()
}

export function normalizeLmsPathCode(value: string): string {
  return value.trim().toUpperCase()
}

const orgTenantFields = {
  organizationId: uuid,
  orgSlug: z.string().min(1),
}

export const createLmsCourseFormSchema = z.object({
  ...orgTenantFields,
  code: courseCode,
  title: z.string().trim().min(1).max(200),
  courseType: hrmLmsCourseTypeSchema.default("online_course"),
  category: z.string().trim().max(120).optional(),
  description: z.string().trim().max(4000).optional(),
  provider: z.string().trim().max(200).optional(),
  durationMinutes: z.coerce.number().int().min(0).max(100_000).optional(),
  level: z.string().trim().max(64).optional(),
  language: z.string().trim().max(32).optional(),
  deliveryMode: z.string().trim().min(1).max(64).default("online"),
  validityDays: z.coerce.number().int().min(0).max(3650).optional(),
  trainingCourseId: uuid.optional(),
  selfEnrollAllowed: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true"),
  approvalRequired: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true"),
  complianceMandatory: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true"),
})

export const createLmsContentRefFormSchema = z.object({
  ...orgTenantFields,
  courseId: uuid,
  refType: hrmLmsContentRefTypeSchema.default("internal"),
  label: z.string().trim().min(1).max(200),
  launchUrl: z.string().trim().max(2000).optional(),
  packageRef: z.string().trim().max(500).optional(),
  contentStandard: z.string().trim().max(64).optional(),
  enabled: z
    .string()
    .optional()
    .transform((v) => v !== "off" && v !== "false"),
})

export const createLmsLearningPathFormSchema = z.object({
  ...orgTenantFields,
  code: courseCode,
  name: z.string().trim().min(1).max(200),
  pathType: hrmLmsPathTypeSchema.default("role"),
  description: z.string().trim().max(4000).optional(),
})

export const updateLmsCourseFormSchema = z.object({
  ...orgTenantFields,
  courseId: uuid,
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().max(120).optional(),
  description: z.string().trim().max(4000).optional(),
  selfEnrollAllowed: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true"),
  approvalRequired: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true"),
  complianceMandatory: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true"),
})

export const updateLmsLearningPathFormSchema = z.object({
  ...orgTenantFields,
  learningPathId: uuid,
  name: z.string().trim().min(1).max(200),
  pathType: hrmLmsPathTypeSchema,
  description: z.string().trim().max(4000).optional(),
})

export const addLmsPathCourseFormSchema = z.object({
  ...orgTenantFields,
  learningPathId: uuid,
  courseId: uuid,
})

const assignTargetRefine = (
  data: { courseId?: string; learningPathId?: string },
  ctx: z.RefinementCtx
) => {
  const hasCourse = Boolean(data.courseId)
  const hasPath = Boolean(data.learningPathId)
  if (hasCourse === hasPath) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select either a course or a learning path.",
      path: ["form"],
    })
  }
}

const optionalUuidField = z.preprocess(
  (val) => (val === "" || val == null ? undefined : val),
  uuid.optional()
)

export const assignLmsFormSchema = z
  .object({
    ...orgTenantFields,
    employeeId: uuid,
    courseId: optionalUuidField,
    learningPathId: optionalUuidField,
    mandatory: z
      .string()
      .optional()
      .transform((v) => v === "on" || v === "true"),
  })
  .superRefine(assignTargetRefine)

export const selfEnrollLmsCourseFormSchema = z.object({
  ...orgTenantFields,
  courseId: uuid,
})

export const lmsEnrollmentDecisionFormSchema = z.object({
  ...orgTenantFields,
  enrollmentId: uuid,
})

const lessonCode = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .regex(/^[A-Za-z0-9._-]+$/)

export function normalizeLmsLessonCode(value: string): string {
  return value.trim().toUpperCase()
}

export const createLmsLessonFormSchema = z.object({
  ...orgTenantFields,
  courseId: uuid,
  code: lessonCode,
  title: z.string().trim().min(1).max(200),
  estimatedMinutes: z.coerce.number().int().min(0).max(10_000).optional(),
})

export const createLmsAssessmentFormSchema = z.object({
  ...orgTenantFields,
  courseId: uuid,
  code: lessonCode,
  title: z.string().trim().min(1).max(200),
  passingScore: z.coerce.number().int().min(0).max(100).default(70),
  maxAttempts: z.coerce.number().int().min(1).max(20).default(3),
})

export const advanceLmsLessonFormSchema = z.object({
  ...orgTenantFields,
  enrollmentId: uuid,
  lessonId: uuid,
})

export const submitLmsAssessmentAttemptFormSchema = z.object({
  ...orgTenantFields,
  enrollmentId: uuid,
  assessmentId: uuid,
  score: z.coerce.number().int().min(0).max(100),
})

export const issueLmsCertificateFormSchema = z.object({
  ...orgTenantFields,
  enrollmentId: uuid,
  certificateRef: z.string().trim().max(200).optional(),
})

export const renewLmsCertificateFormSchema = z.object({
  ...orgTenantFields,
  certificateId: uuid,
})

export const dispatchLmsReminderFormSchema = z.object({
  ...orgTenantFields,
  reminderId: z.string().trim().min(1).max(120),
})

export const HRM_LMS_COURSE_TYPE_OPTIONS = HRM_LMS_COURSE_TYPES
export const HRM_LMS_CONTENT_REF_TYPE_OPTIONS = HRM_LMS_CONTENT_REF_TYPES
export const HRM_LMS_PATH_TYPE_OPTIONS = HRM_LMS_PATH_TYPES
