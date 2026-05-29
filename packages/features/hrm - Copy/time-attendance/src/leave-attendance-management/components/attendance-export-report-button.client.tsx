"use client"

import { exportAttendanceSummaryReportAction } from "@afenda/feature-hrm-time-attendance/client"

import { ATTENDANCE_EXPORT_REPORT_TRIGGER_ID } from "../data/attendance-surface-metadata.shared"

import { LamExportReportButton } from "./lam-export-report-button.client"

export function AttendanceExportReportButton() {
  return (
    <LamExportReportButton
      kind="attendance"
      triggerElementId={ATTENDANCE_EXPORT_REPORT_TRIGGER_ID}
      exportAction={exportAttendanceSummaryReportAction}
    />
  )
}
