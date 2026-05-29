"use server"

import { after } from "next/server"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"

import { HRM_COMPLIANCE_REGULATORY_AUDIT } from "../compliance-regulatory.contract"
import { buildComplianceOverviewCsv } from "../data/compliance-overview-export.shared"
import { listComplianceOverviewRowsForOrg } from "../data/compliance-overview.queries.server"
import { requireComplianceSessionMutationGate } from "../data/compliance-action-guard.server"

export async function exportComplianceOverviewCsvAction(): Promise<
  { ok: true; csv: string; filename: string } | { ok: false; error: string }
> {
  const gate = await requireComplianceSessionMutationGate("read")
  if (!gate.ok) return { ok: false, error: gate.error }

  const rows = await listComplianceOverviewRowsForOrg(gate.organizationId)
  const asOf = new Date().toISOString().slice(0, 10)
  const csv = buildComplianceOverviewCsv(rows)
  const filename = `compliance-overview-${asOf}.csv`

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_COMPLIANCE_REGULATORY_AUDIT.report.exported,
      actorUserId: gate.userId,
      actorSessionId: gate.sessionId,
      organizationId: gate.organizationId,
      resourceType: "hrm_compliance_report",
      resourceId: `overview-${asOf}`,
      metadata: {
        rowCount: rows.length,
        format: "csv",
      },
    })
  )

  return { ok: true, csv, filename }
}
