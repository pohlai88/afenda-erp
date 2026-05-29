"use server"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { ExportFhcReportFormState } from "@afenda/feature-hrm-core/shared"
import { HRM_FHC_AUDIT } from "../fhc.contract"
import { buildFhcComplianceReportCsv } from "../data/fhc-report-export.server"

export async function exportFhcComplianceReportAction(
  _prev: ExportFhcReportFormState | undefined,
  _formData: FormData
): Promise<ExportFhcReportFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId, sessionId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "food_handler_compliance",
      function: "audit",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to export compliance reports.",
    })
  }

  const report = await buildFhcComplianceReportCsv({
    organizationId,
    canIncludeHealthDetails: true,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.reportExport,
    actorUserId: userId,
    actorSessionId: sessionId,
    organizationId,
    resourceType: "food_handler_compliance_report",
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
