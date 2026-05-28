"use client"

import { exportLeaveRequestsReportAction } from "../../../time-attendance/client"

import { LamExportReportButton } from "./lam-export-report-button.client"

import { LEAVE_EXPORT_REPORT_TRIGGER_ID } from "../data/leave-surface-metadata.shared"

export function LeaveExportReportButton() {
  return (
    <LamExportReportButton
      kind="leave"
      triggerElementId={LEAVE_EXPORT_REPORT_TRIGGER_ID}
      exportAction={exportLeaveRequestsReportAction}
    />
  )
}
