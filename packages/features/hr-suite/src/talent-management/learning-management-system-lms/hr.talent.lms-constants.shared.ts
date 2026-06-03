export const HR_LMS_COURSE_TYPES = [
  "online_course",
  "video_lesson",
  "reading_module",
  "quiz",
  "assessment",
  "certification",
  "compliance_training",
  "blended_learning_reference",
] as const;

export type HrLmsCourseType = (typeof HR_LMS_COURSE_TYPES)[number];

export const HR_LMS_PATH_KINDS = [
  "role_based",
  "department_based",
  "onboarding",
  "compliance",
  "safety",
  "leadership",
  "certification",
  "general",
] as const;

export type HrLmsPathKind = (typeof HR_LMS_PATH_KINDS)[number];

export const HR_LMS_ASSIGNMENT_KINDS = ["mandatory", "optional"] as const;

export type HrLmsAssignmentKind = (typeof HR_LMS_ASSIGNMENT_KINDS)[number];

export const HR_LMS_PROGRESS_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "failed",
  "overdue",
  "expired",
  "renewed",
  "cancelled",
] as const;

export type HrLmsProgressStatus = (typeof HR_LMS_PROGRESS_STATUSES)[number];

export const HR_LMS_REPORT_GROUP_BY = [
  "employee",
  "course",
  "learning_path",
  "department",
  "manager",
  "certification",
  "status",
  "provider",
  "period",
] as const;

export type HrLmsReportGroupBy = (typeof HR_LMS_REPORT_GROUP_BY)[number];

export const HR_LMS_READ_CAPABILITY = "hr.lms.read" as const;
export const HR_LMS_WRITE_CAPABILITY = "hr.lms.write" as const;
