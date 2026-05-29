"use server"

import { requireOrgSession, writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { ExportRwsReportFormState } from "@afenda/feature-hrm-core/shared"
import { HRM_RWS_AUDIT } from "../rws.contract"
import { buildRwsOrgReportCsv } from "../data/rws-reports.server"
import { exportRwsReportFormSchema } from "../schemas/rws.schema"

export async function exportRwsReportAction(
  _prev: ExportRwsReportFormState | undefined,
  formData: FormData
): Promise<ExportRwsReportFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId, sessionId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "retail_schedule",
      function: "audit",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to export retail scheduling reports.",
    })
  }

  const parsed = exportRwsReportFormSchema.safeParse({
    reportKind: formData.get("reportKind") ?? "coverage",
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const report = await buildRwsOrgReportCsv({
    organizationId,
    reportKind: parsed.data.reportKind,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_RWS_AUDIT.reportExport,
    actorUserId: userId,
    actorSessionId: sessionId,
    organizationId,
    resourceType: "hrm_rws_report",
    resourceId: report.filename,
    metadata: { rowCount: report.rowCount, reportKind: parsed.data.reportKind },
  })

  return {
    ok: true,
    csv: report.csv,
    filename: report.filename,
    rowCount: report.rowCount,
  }
}
