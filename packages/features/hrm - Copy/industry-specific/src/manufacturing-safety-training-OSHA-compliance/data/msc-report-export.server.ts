import "server-only"

import { listMscEmployeeObligationsForOrg } from "./msc.queries.server"

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function buildMscComplianceReportCsv(input: {
  organizationId: string
}): Promise<{ csv: string; filename: string; rowCount: number }> {
  const rows = await listMscEmployeeObligationsForOrg(input.organizationId)

  const header = [
    "employee",
    "employee_number",
    "site",
    "compliance_status",
    "computed_status",
    "computed_at",
    "cert_expiry",
  ]
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        escapeCsvCell(row.employeeLabel),
        escapeCsvCell(row.employeeNumber ?? ""),
        escapeCsvCell(row.siteLabel ?? ""),
        escapeCsvCell(row.complianceStatus),
        escapeCsvCell(row.computedStatus),
        escapeCsvCell(row.computedAt ? row.computedAt.toISOString() : ""),
        escapeCsvCell(row.certExpiryDate ?? ""),
      ].join(",")
    ),
  ]
  const stamp = new Date().toISOString().slice(0, 10)
  return {
    csv: lines.join("\n"),
    filename: `manufacturing-safety-compliance-${stamp}.csv`,
    rowCount: rows.length,
  }
}
