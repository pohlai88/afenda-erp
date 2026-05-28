import type { HrmLmsProgressRow } from "./lms.types.shared"

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildLmsProgressReportCsv(
  rows: readonly HrmLmsProgressRow[]
): string {
  const header = [
    "employee_number",
    "employee_name",
    "target",
    "status",
    "percent_complete",
    "time_spent_minutes",
    "last_accessed_at",
  ]
  const lines = rows.map((row) =>
    [
      row.employeeNumber,
      row.employeeName,
      row.targetLabel,
      row.displayStatus,
      String(row.percentComplete),
      String(row.timeSpentMinutes),
      row.lastAccessedAt?.toISOString() ?? "",
    ]
      .map(escapeCsvCell)
      .join(",")
  )
  return [header.join(","), ...lines].join("\n")
}
