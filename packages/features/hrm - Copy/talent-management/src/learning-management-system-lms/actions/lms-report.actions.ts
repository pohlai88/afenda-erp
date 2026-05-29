"use server"

import { after } from "next/server"

import { requireOrgSession, writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"

import { HRM_LMS_AUDIT } from "../lms.contract"
import { resolveLmsSurfaceAccess } from "../data/lms-access.server"
import { listLmsProgressForOrg } from "../data/lms-progress.queries.server"
import { buildLmsProgressReportCsv } from "../data/lms-report-export.shared"

export async function exportLmsProgressReportCsvAction(): Promise<
  { ok: true; csv: string; filename: string } | { ok: false; error: string }
> {
  const session = await requireOrgSession()
  const { organizationId, userId, sessionId } = session

  const access = await resolveLmsSurfaceAccess({ organizationId, userId })
  if (!access.canExportReports) {
    return {
      ok: false,
      error: "You are not authorized to export LMS reports.",
    }
  }

  const rows = await listLmsProgressForOrg(organizationId)
  const asOf = new Date().toISOString().slice(0, 10)
  const csv = buildLmsProgressReportCsv(rows)
  const filename = `lms-progress-report-${asOf}.csv`

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.reportExport,
      actorUserId: userId,
      actorSessionId: sessionId,
      organizationId,
      resourceType: "hrm_lms_report",
      resourceId: `progress-${asOf}`,
      metadata: {
        reportKey: "progress",
        rowCount: rows.length,
        format: "csv",
      },
    })
  )

  return { ok: true, csv, filename }
}
