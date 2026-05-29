/**
 * Governed list builders delegate section chrome to Pattern B/C section components;
 * configuration headers carry only the stable columns id (TCI `tciListHeader` parity).
 */
export function lmsListHeader(columnsId: string) {
  return { title: columnsId }
}

export const LMS_COURSES_SURFACE_KEY = "hrm:lms:courses" as const
export const LMS_LEARNING_PATHS_SURFACE_KEY = "hrm:lms:learning-paths" as const
export const LMS_ASSIGNMENTS_SURFACE_KEY = "hrm:lms:assignments" as const
export const LMS_ENROLLMENT_APPROVALS_SURFACE_KEY =
  "hrm:lms:enrollment-approvals" as const
export const LMS_MY_LEARNING_SURFACE_KEY = "hrm:lms:my-learning" as const
export const LMS_CERTIFICATES_SURFACE_KEY = "hrm:lms:certificates" as const

export const LMS_PROGRESS_SURFACE_KEY = "hrm:lms:progress" as const
export const LMS_LEARNING_HISTORY_SURFACE_KEY =
  "hrm:lms:learning-history" as const
export const LMS_REMINDERS_SURFACE_KEY = "hrm:lms:reminders" as const
export const LMS_REPORTS_SURFACE_KEY = "hrm:lms:reports" as const

export const LMS_COURSES_LIST_COLUMNS_ID = "hrm-lms-courses" as const
export const LMS_LEARNING_PATHS_LIST_COLUMNS_ID =
  "hrm-lms-learning-paths" as const
export const LMS_ASSIGNMENTS_LIST_COLUMNS_ID = "hrm-lms-assignments" as const
export const LMS_ENROLLMENT_APPROVALS_LIST_COLUMNS_ID =
  "hrm-lms-enrollment-approvals" as const
export const LMS_MY_LEARNING_LIST_COLUMNS_ID = "hrm-lms-my-learning" as const
export const LMS_CERTIFICATES_LIST_COLUMNS_ID = "hrm-lms-certificates" as const
export const LMS_PROGRESS_LIST_COLUMNS_ID = "hrm-lms-progress" as const
export const LMS_LEARNING_HISTORY_LIST_COLUMNS_ID =
  "hrm-lms-learning-history" as const
export const LMS_REMINDERS_LIST_COLUMNS_ID = "hrm-lms-reminders" as const
export const LMS_REPORTS_LIST_COLUMNS_ID = "hrm-lms-reports" as const
