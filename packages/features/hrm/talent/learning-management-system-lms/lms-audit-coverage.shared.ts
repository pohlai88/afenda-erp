import { HRM_LMS_AUDIT } from "./lms.contract"

/**
 * Audit keys that must appear in at least one LMS action emitter on disk.
 * Reserved contract keys without a v1 mutation path are listed separately.
 */
export const HRM_LMS_AUDIT_EMITTED_KEYS = [
  "courseCreate",
  "courseUpdate",
  "courseDeprecate",
  "learningPathCreate",
  "learningPathUpdate",
  "learningPathDeprecate",
  "pathCourseCreate",
  "contentRefCreate",
  "assignmentCreate",
  "enrollmentCreate",
  "enrollmentApprove",
  "enrollmentReject",
  "lessonCreate",
  "progressUpdate",
  "assessmentCreate",
  "assessmentAttemptCreate",
  "certificateIssue",
  "certificateRenew",
  "reminderDispatch",
  "reportExport",
] as const satisfies readonly (keyof typeof HRM_LMS_AUDIT)[]

export const HRM_LMS_AUDIT_RESERVED_KEYS =
  [] as const satisfies readonly (keyof typeof HRM_LMS_AUDIT)[]

export function listHrmLmsAuditContractKeys(): string[] {
  return Object.keys(HRM_LMS_AUDIT)
}
