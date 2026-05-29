import "server-only"

import { listUcbCollectiveAgreementsForOrg } from "./ucb-cba.server"
import { listUcbComplianceFindingsForOrg } from "./ucb-overview.server"
import { listUcbDuesReferencesForOrg } from "./ucb-dues.server"
import { listUcbGrievancesForOrg } from "./ucb-grievance.server"
import { listUcbMembershipsForOrg } from "./ucb-membership.server"

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function csvRow(cells: string[]): string {
  return cells.map(escapeCsv).join(",")
}

export async function buildUcbOrgReportCsv(input: {
  organizationId: string
  reportKind: string
}): Promise<{ csv: string; rowCount: number }> {
  const lines: string[] = []

  switch (input.reportKind) {
    case "membership": {
      const rows = await listUcbMembershipsForOrg(input.organizationId)
      lines.push(
        csvRow([
          "employee",
          "union",
          "bargaining_unit",
          "status",
          "start",
          "end",
        ])
      )
      for (const row of rows) {
        lines.push(
          csvRow([
            row.employeeLabel,
            row.unionLabel,
            row.bargainingUnitLabel ?? "",
            row.status,
            row.membershipStartDate ?? "",
            row.membershipEndDate ?? "",
          ])
        )
      }
      return { csv: lines.join("\n"), rowCount: rows.length }
    }
    case "grievances": {
      const rows = await listUcbGrievancesForOrg(input.organizationId)
      lines.push(
        csvRow([
          "employee",
          "category",
          "severity",
          "status",
          "agreement",
          "summary",
        ])
      )
      for (const row of rows) {
        lines.push(
          csvRow([
            row.employeeLabel,
            row.category,
            row.severity,
            row.status,
            row.agreementTitle ?? "",
            row.summary,
          ])
        )
      }
      return { csv: lines.join("\n"), rowCount: rows.length }
    }
    case "compliance": {
      const rows = await listUcbComplianceFindingsForOrg(input.organizationId)
      lines.push(
        csvRow(["code", "severity", "employee", "agreement", "message", "resolved"])
      )
      for (const row of rows) {
        lines.push(
          csvRow([
            row.findingCode,
            row.severity,
            row.employeeLabel ?? "",
            row.agreementTitle ?? "",
            row.message,
            row.resolvedAt ?? "",
          ])
        )
      }
      return { csv: lines.join("\n"), rowCount: rows.length }
    }
    case "dues": {
      const rows = await listUcbDuesReferencesForOrg(input.organizationId)
      lines.push(
        csvRow(["employee", "amount_ref", "currency", "approval", "effective_from"])
      )
      for (const row of rows) {
        lines.push(
          csvRow([
            row.employeeLabel,
            row.amountRef,
            row.currencyCode,
            row.approvalState,
            row.effectiveFrom ?? "",
          ])
        )
      }
      return { csv: lines.join("\n"), rowCount: rows.length }
    }
    case "agreements": {
      const rows = await listUcbCollectiveAgreementsForOrg(input.organizationId)
      lines.push(
        csvRow([
          "title",
          "version",
          "union",
          "unit",
          "status",
          "effective_from",
          "effective_to",
        ])
      )
      for (const row of rows) {
        lines.push(
          csvRow([
            row.title,
            row.versionLabel,
            row.unionLabel,
            row.bargainingUnitLabel ?? "",
            row.status,
            row.effectiveFrom ?? "",
            row.effectiveTo ?? "",
          ])
        )
      }
      return { csv: lines.join("\n"), rowCount: rows.length }
    }
    default:
      return { csv: "", rowCount: 0 }
  }
}
