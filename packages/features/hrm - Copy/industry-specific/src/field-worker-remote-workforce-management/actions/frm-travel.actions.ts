"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { CreateFrmTravelStatusFormState } from "@afenda/feature-hrm-core/shared"
import { listFrmAssignmentsForOrg } from "../data/frm-assignments.server"
import { createFrmTravelStatus } from "../data/frm-travel.server"
import { createFrmTravelStatusFormSchema } from "../schemas/frm.schema"

export async function createFrmTravelStatusAction(
  _prev: CreateFrmTravelStatusFormState | undefined,
  formData: FormData
): Promise<CreateFrmTravelStatusFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "field_workforce",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage field travel records.",
    })
  }

  const assignment = await listFrmAssignmentsForOrg(organizationId)
  const assignmentId = String(formData.get("assignmentId") ?? "").trim()
  const match = assignment.find((row) => row.id === assignmentId)
  if (!match) {
    return hrmActionFailure({ form: "Assignment not found." })
  }

  const parsed = createFrmTravelStatusFormSchema.safeParse({
    assignmentId,
    travelClass: formData.get("travelClass"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || null,
    destinationCountry: formData.get("destinationCountry") || null,
    destinationCity: formData.get("destinationCity") || null,
    travelApprovalRef: formData.get("travelApprovalRef") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createFrmTravelStatus({
    organizationId,
    userId,
    assignmentId: parsed.data.assignmentId,
    employeeId: match.employeeId,
    travelClass: parsed.data.travelClass,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate ?? null,
    destinationCountry: parsed.data.destinationCountry ?? null,
    destinationCity: parsed.data.destinationCity ?? null,
    travelApprovalRef: parsed.data.travelApprovalRef ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, travelStatusId: result.travelStatusId }
}
