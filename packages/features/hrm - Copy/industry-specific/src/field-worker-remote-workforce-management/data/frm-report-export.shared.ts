import type { FrmAssignmentRow } from "./frm.types.shared"
import type { FrmExceptionRow } from "./frm.types.shared"
import type { FrmTravelStatusRow } from "./frm.types.shared"

export function buildFrmFieldWorkforceReportCsv(input: {
  assignments: readonly FrmAssignmentRow[]
  exceptions: readonly FrmExceptionRow[]
  travel: readonly FrmTravelStatusRow[]
}): string {
  const lines: string[] = [
    "section,id,employee,label,date,state,detail",
    ...input.assignments.map(
      (row) =>
        `assignment,${row.id},${row.employeeId},${escapeCsv(row.employeeLabel)},${row.startDate},${row.state},${escapeCsv(row.worksiteLabel)}`
    ),
    ...input.exceptions.map(
      (row) =>
        `exception,${row.id},${row.employeeId},${escapeCsv(row.employeeLabel)},${row.exceptionDate},${row.state},${row.exceptionCode}`
    ),
    ...input.travel.map(
      (row) =>
        `travel,${row.id},${row.employeeId},${escapeCsv(row.employeeLabel)},${row.startDate},${row.state},${row.travelClass}`
    ),
  ]
  return lines.join("\n")
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
