"use server"

import { requireOrgSession, writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import { buildUcbOrgReportCsv } from "../data/ucb-reports.server"
import { HRM_UCB_AUDIT } from "../ucb.contract"
import {
  exportUcbReportFormSchema,
  type ExportUcbReportFormState,
} from "../schemas/ucb.schema"

async function requireUcbAuditPermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "union_collective_bargaining",
      function: "audit",
    },
  })
  if (!allowed) {
    const readAllowed = await canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "union_collective_bargaining",
        function: "read",
      },
    })
    if (!readAllowed) {
      return hrmActionFailure({
        form: "You are not authorized to export union management reports.",
      })
    }
  }
  return null
}

export async function exportUcbReportAction(
  _prev: ExportUcbReportFormState | undefined,
  formData: FormData
): Promise<ExportUcbReportFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbAuditPermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = exportUcbReportFormSchema.safeParse({
    reportKind: formData.get("reportKind"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const { csv, rowCount } = await buildUcbOrgReportCsv({
    organizationId: session.organizationId,
    reportKind: parsed.data.reportKind,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.reportExport,
    actorUserId: session.userId,
    organizationId: session.organizationId,
    resourceType: "hrm_ucb_report",
    resourceId: parsed.data.reportKind,
    metadata: { rowCount },
  })

  return {
    ok: true,
    csv,
    filename: `union-management-${parsed.data.reportKind}.csv`,
    rowCount,
  }
}
