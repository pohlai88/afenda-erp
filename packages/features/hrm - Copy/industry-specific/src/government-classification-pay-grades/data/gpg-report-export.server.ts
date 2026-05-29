import "server-only"

import { listGpgEmployeeAssignmentsForOrg } from "./gpg-assignments.server"

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function buildGpgOrgReportCsv(input: {
  organizationId: string
}): Promise<{ csv: string; filename: string; rowCount: number }> {
  const rows = await listGpgEmployeeAssignmentsForOrg(input.organizationId)
  const header = [
    "employee",
    "classification",
    "pay_grade",
    "pay_band",
    "step",
    "appointment_type",
    "effective_from",
    "effective_to",
    "base_rate",
    "adjusted_pay_reference",
    "currency",
    "state",
  ]
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        escapeCsvCell(row.employeeLabel),
        escapeCsvCell(row.classificationLabel),
        escapeCsvCell(row.payGradeLabel),
        escapeCsvCell(row.payBandLabel ?? ""),
        escapeCsvCell(String(row.step)),
        escapeCsvCell(row.appointmentType),
        escapeCsvCell(row.effectiveFrom),
        escapeCsvCell(row.effectiveTo ?? ""),
        escapeCsvCell(row.baseRate ?? ""),
        escapeCsvCell(row.adjustedPayReference ?? ""),
        escapeCsvCell(row.currencyCode ?? ""),
        escapeCsvCell(row.state),
      ].join(",")
    ),
  ]
  const stamp = new Date().toISOString().slice(0, 10)
  return {
    csv: lines.join("\n"),
    filename: `government-pay-grades-${stamp}.csv`,
    rowCount: rows.length,
  }
}
