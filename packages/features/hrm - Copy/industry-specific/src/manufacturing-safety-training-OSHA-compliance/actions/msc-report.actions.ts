"use server"

import { requireOrgSession, writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { ExportMscReportFormState } from "../data/msc-form-state.shared"
import { buildMscComplianceReportCsv } from "../data/msc-report-export.server"
import { HRM_MSC_AUDIT } from "../msc.contract"

export async function exportMscComplianceReportAction(
  _prev: ExportMscReportFormState | undefined,
  _formData: FormData
): Promise<ExportMscReportFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId, sessionId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "manufacturing_safety",
      function: "audit",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to export manufacturing safety reports.",
    })
  }

  const report = await buildMscComplianceReportCsv({ organizationId })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.reportExport,
    actorUserId: userId,
    actorSessionId: sessionId,
    organizationId,
    resourceType: "manufacturing_safety_report",
    resourceId: report.filename,
    metadata: { rowCount: report.rowCount },
  })

  return {
    ok: true,
    csv: report.csv,
    filename: report.filename,
    rowCount: report.rowCount,
  }
}
