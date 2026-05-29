"use server"

import {
  requireOrgSession,
  writeIamAuditEventFromNextHeaders,
} from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { ExportGpgReportFormState } from "@afenda/feature-hrm-core/shared"
import { HRM_GPG_AUDIT } from "../gpg.contract"
import { buildGpgOrgReportCsv } from "../data/gpg-report-export.server"

export async function exportGpgOrgReportAction(
  _prev: ExportGpgReportFormState | undefined,
  _formData: FormData
): Promise<ExportGpgReportFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId, sessionId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "government_pay_grade",
      function: "audit",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to export government pay grade reports.",
    })
  }

  const report = await buildGpgOrgReportCsv({ organizationId })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.reportExport,
    actorUserId: userId,
    actorSessionId: sessionId,
    organizationId,
    resourceType: "government_pay_grade_report",
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
