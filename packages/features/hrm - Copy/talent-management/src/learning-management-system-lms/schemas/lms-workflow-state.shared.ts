import { z } from "zod"

export const HRM_LMS_COURSE_TYPES = [
  "online_course",
  "video_lesson",
  "reading_module",
  "quiz",
  "assessment",
  "certification",
  "compliance_training",
  "blended_reference",
] as const

export const HRM_LMS_PATH_TYPES = [
  "role",
  "department",
  "onboarding",
  "compliance",
  "safety",
  "leadership",
  "certification",
] as const

export const HRM_LMS_CONTENT_REF_TYPES = [
  "internal",
  "external",
  "scorm",
  "xapi",
] as const

export const HRM_LMS_PROGRESS_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "failed",
  "overdue",
  "expired",
  "renewed",
  "cancelled",
] as const

export const HRM_LMS_ENROLLMENT_APPROVAL_STATES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
] as const

export const HRM_LMS_MASTER_STATES = ["draft", "active", "archived"] as const

export const hrmLmsCourseTypeSchema = z.enum(HRM_LMS_COURSE_TYPES)
export const hrmLmsPathTypeSchema = z.enum(HRM_LMS_PATH_TYPES)
export const hrmLmsContentRefTypeSchema = z.enum(HRM_LMS_CONTENT_REF_TYPES)
export const hrmLmsProgressStatusSchema = z.enum(HRM_LMS_PROGRESS_STATUSES)
export const hrmLmsEnrollmentApprovalStateSchema = z.enum(
  HRM_LMS_ENROLLMENT_APPROVAL_STATES
)
export const hrmLmsMasterStateSchema = z.enum(HRM_LMS_MASTER_STATES)

export type HrmLmsCourseType = z.infer<typeof hrmLmsCourseTypeSchema>
export type HrmLmsPathType = z.infer<typeof hrmLmsPathTypeSchema>
export type HrmLmsContentRefType = z.infer<typeof hrmLmsContentRefTypeSchema>
export type HrmLmsProgressStatus = z.infer<typeof hrmLmsProgressStatusSchema>
export type HrmLmsEnrollmentApprovalState = z.infer<
  typeof hrmLmsEnrollmentApprovalStateSchema
>
export type HrmLmsMasterState = z.infer<typeof hrmLmsMasterStateSchema>
