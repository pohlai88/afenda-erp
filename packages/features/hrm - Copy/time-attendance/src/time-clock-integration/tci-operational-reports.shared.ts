/**
 * HRM-TCI-028 — operational CSV reports with dynamic slice filters.
 *
 * Dimensions: employee, device, location, department, date range, exception type
 * (`detectionOutcome`), and device sync status. Optional `rowKinds` limits which
 * `row_kind` sections are emitted (empty = full operational export).
 */

import {
  TCI_DETECTION_OUTCOMES,
  TCI_DEVICE_SYNC_STATUSES,
} from "./schemas/tci-workflow-state.shared"

export const TCI_REPORT_BUILD_SYMBOL = "buildTimeClockReportCsv" as const

export const TCI_REPORT_EXPORT_ACTION_SYMBOL =
  "exportTimeClockReportAction" as const

export const TCI_REPORT_FILTER_OPTIONS_SYMBOL =
  "listTimeClockReportFilterOptions" as const

export const TCI_REPORT_FILTER_DIMENSIONS = [
  "employee",
  "device",
  "location",
  "department",
  "date",
  "exceptionType",
  "syncStatus",
] as const

export type TciReportFilterDimension =
  (typeof TCI_REPORT_FILTER_DIMENSIONS)[number]

export const TCI_REPORT_EXCEPTION_TYPE_FIELD = "detectionOutcome" as const

export const TCI_REPORT_SYNC_STATUS_FIELD = "syncStatus" as const

export const TCI_REPORT_ROW_KINDS = [
  "punch",
  "exception",
  "sync_batch",
  "sync_monitoring",
  "missing_punch",
  "duplicate_punch",
  "abnormal_punch",
  "shift_match",
  "attendance_handoff",
  "overtime_reference",
  "payroll_reference",
  "correction_workflow",
  "raw_vs_approved",
  "audit_trail",
] as const

export type TciReportRowKind = (typeof TCI_REPORT_ROW_KINDS)[number]

export const TCI_REPORT_CSV_COLUMNS = [
  "row_kind",
  "attendance_date",
  "employee_number",
  "employee_legal_name",
  "external_device_id",
  "device_name",
  "location_ref",
  "department_code",
  "device_sync_status",
  "event_type",
  "occurred_at",
  "source_ref",
  "sync_batch_id",
  "detection_outcome",
  "exception_state",
  "exception_reason",
] as const

export type TciOperationalReportSurface =
  | {
      readonly door: "server_action"
      readonly symbol: typeof TCI_REPORT_EXPORT_ACTION_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-028"]
    }
  | {
      readonly door: "report_builder"
      readonly symbol: typeof TCI_REPORT_BUILD_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-028"]
    }
  | {
      readonly door: "pattern_a_ui"
      readonly symbol: "TimeClockReportExportForm"
      readonly requirementCodes: readonly ["HRM-TCI-028"]
    }

export const TCI_OPERATIONAL_REPORT_SURFACES = [
  {
    door: "server_action",
    symbol: TCI_REPORT_EXPORT_ACTION_SYMBOL,
    requirementCodes: ["HRM-TCI-028"],
  },
  {
    door: "report_builder",
    symbol: TCI_REPORT_BUILD_SYMBOL,
    requirementCodes: ["HRM-TCI-028"],
  },
  {
    door: "pattern_a_ui",
    symbol: "TimeClockReportExportForm",
    requirementCodes: ["HRM-TCI-028"],
  },
] as const satisfies readonly TciOperationalReportSurface[]

export function isTciReportRowKind(value: string): value is TciReportRowKind {
  return (TCI_REPORT_ROW_KINDS as readonly string[]).includes(value)
}

export function shouldIncludeTciReportRowKind(
  rowKind: TciReportRowKind,
  rowKinds: readonly TciReportRowKind[] | undefined
): boolean {
  if (!rowKinds?.length) return true
  return rowKinds.includes(rowKind)
}

export function assertHrmTci028OperationalReports(): void {
  if (TCI_REPORT_CSV_COLUMNS[0] !== "row_kind") {
    throw new Error("TCI report CSV must lead with row_kind")
  }
  if (!TCI_REPORT_CSV_COLUMNS.includes("location_ref")) {
    throw new Error("TCI report CSV must expose location_ref for HRM-TCI-028")
  }
  if (!TCI_REPORT_CSV_COLUMNS.includes("department_code")) {
    throw new Error(
      "TCI report CSV must expose department_code for HRM-TCI-028"
    )
  }
  if (!TCI_REPORT_CSV_COLUMNS.includes("device_sync_status")) {
    throw new Error(
      "TCI report CSV must expose device_sync_status for HRM-TCI-028"
    )
  }

  for (const dimension of TCI_REPORT_FILTER_DIMENSIONS) {
    if (!dimension) {
      throw new Error("TCI report filter dimensions must be non-empty")
    }
  }

  for (const outcome of TCI_DETECTION_OUTCOMES) {
    if (!outcome) {
      throw new Error(
        "TCI detection outcomes must be defined for exception-type filters"
      )
    }
  }

  for (const status of TCI_DEVICE_SYNC_STATUSES) {
    if (!status) {
      throw new Error(
        "TCI device sync statuses must be defined for sync filters"
      )
    }
  }

  for (const surface of TCI_OPERATIONAL_REPORT_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-028")) {
      throw new Error(
        `TCI operational report surface "${surface.symbol}" must cite HRM-TCI-028`
      )
    }
  }
}
