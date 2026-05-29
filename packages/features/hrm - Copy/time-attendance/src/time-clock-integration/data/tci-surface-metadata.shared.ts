export const TCI_STAT_SURFACE_KEY = "hrm:time-clock:kpi-summary" as const

export const TCI_LIST_SURFACE_IDS = {
  devices: "hrm:time-clock:devices",
  mappings: "hrm:time-clock:mappings",
  punchRecords: "hrm:time-clock:punch-records",
  breakPunchRecords: "hrm:time-clock:break-punch-records",
  exceptions: "hrm:time-clock:exceptions",
  missingPunchFindings: "hrm:time-clock:missing-punch-findings",
  duplicatePunchFindings: "hrm:time-clock:duplicate-punch-findings",
  abnormalPunchFindings: "hrm:time-clock:abnormal-punch-findings",
  shiftMatchFindings: "hrm:time-clock:shift-match-findings",
  attendanceHandoffFindings: "hrm:time-clock:attendance-handoff-findings",
  overtimeReferenceFindings: "hrm:time-clock:overtime-reference-findings",
  payrollReferenceFindings: "hrm:time-clock:payroll-reference-findings",
  correctionWorkflow: "hrm:time-clock:correction-workflow",
  syncBatches: "hrm:time-clock:sync-batches",
  syncMonitoringFindings: "hrm:time-clock:sync-monitoring-findings",
  rawVsApprovedFindings: "hrm:time-clock:raw-vs-approved-findings",
  auditTrail: "hrm:time-clock:audit-trail",
} as const

export type TciListSurfaceId =
  (typeof TCI_LIST_SURFACE_IDS)[keyof typeof TCI_LIST_SURFACE_IDS]
