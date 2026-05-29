/**
 * Governed list-surface vocabulary for attendance (metadata only).
 */

export const ATTENDANCE_LIST_SURFACE_IDS = {
  recentEvents: "hrm-attendance-recent-events",
  correctionPending: "hrm-attendance-correction-pending",
  portalDays: "ess-attendance-days",
} as const

export type AttendanceListSurfaceId =
  (typeof ATTENDANCE_LIST_SURFACE_IDS)[keyof typeof ATTENDANCE_LIST_SURFACE_IDS]

/** Client export button id — must match `toolbar.export.triggerElementId`. */
export const ATTENDANCE_EXPORT_REPORT_TRIGGER_ID =
  "attendance-export-report-trigger"
