import "server-only"

import { and, eq, inArray } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmFhcHealthCertificate } from "@afenda/platform/db/schema"

import { redactFhcHealthCertificateRef } from "./fhc-health-redaction.shared"
import { listFhcEmployeeObligationsForOrg } from "./fhc.queries.server"

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function buildFhcComplianceReportCsv(input: {
  organizationId: string
  canIncludeHealthDetails: boolean
}): Promise<{ csv: string; filename: string; rowCount: number }> {
  const rows = await listFhcEmployeeObligationsForOrg(input.organizationId)
  const obligationIds = rows.map((row) => row.id)
  const healthByObligation = new Map<string, string | null>()

  if (obligationIds.length > 0) {
    const healthRows = await db.query.hrmFhcHealthCertificate.findMany({
      where: and(
        eq(hrmFhcHealthCertificate.organizationId, input.organizationId),
        inArray(hrmFhcHealthCertificate.obligationId, obligationIds)
      ),
      columns: { obligationId: true, certificateRef: true },
    })
    for (const health of healthRows) {
      healthByObligation.set(
        health.obligationId,
        redactFhcHealthCertificateRef(
          health.certificateRef,
          input.canIncludeHealthDetails
        )
      )
    }
  }

  const header = [
    "employee",
    "employee_number",
    "outlet",
    "status",
    "computed_at",
    "health_certificate_ref",
    "renewal_state",
    "evidence_links",
  ]
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        escapeCsvCell(row.employeeLabel),
        escapeCsvCell(row.employeeNumber ?? ""),
        escapeCsvCell(row.outletLabel ?? ""),
        escapeCsvCell(row.computedStatus),
        escapeCsvCell(row.computedAt ? row.computedAt.toISOString() : ""),
        escapeCsvCell(healthByObligation.get(row.id) ?? ""),
        escapeCsvCell(row.permitRenewalState ?? ""),
        escapeCsvCell(
          String(row.permitEvidenceCount + row.healthEvidenceCount)
        ),
      ].join(",")
    ),
  ]
  const stamp = new Date().toISOString().slice(0, 10)
  return {
    csv: lines.join("\n"),
    filename: `food-handler-compliance-${stamp}.csv`,
    rowCount: rows.length,
  }
}
