"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type { ExportFrmReportFormState } from "../../../_core/shared"
import { HRM_FRM_AUDIT } from "../frm.contract"
import { listFrmAssignmentsForOrg } from "../data/frm-assignments.server"
import { listFrmExceptionsForOrg } from "../data/frm-exceptions.server"
import { buildFrmFieldWorkforceReportCsv } from "../data/frm-report-export.shared"
import { listFrmTravelStatusesForOrg } from "../data/frm-travel.server"

export async function exportFrmFieldWorkforceReportAction(): Promise<ExportFrmReportFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "field_workforce",
      function: "audit",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to export field workforce reports.",
    })
  }

  const [assignments, exceptions, travel] = await Promise.all([
    listFrmAssignmentsForOrg(organizationId),
    listFrmExceptionsForOrg(organizationId),
    listFrmTravelStatusesForOrg(organizationId),
  ])

  const csv = buildFrmFieldWorkforceReportCsv({
    assignments,
    exceptions,
    travel,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FRM_AUDIT.reportExport,
    actorUserId: userId,
    organizationId,
    resourceType: "field_workforce_report",
    resourceId: organizationId,
    metadata: {
      assignmentCount: assignments.length,
      exceptionCount: exceptions.length,
      travelCount: travel.length,
    },
  })

  return { ok: true, csv }
}
