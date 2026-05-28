"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type { CreateFrmAssignmentFormState } from "../../../_core/shared"
import { createFrmFieldAssignment } from "../data/frm-assignments.server"
import { createFrmAssignmentFormSchema } from "../schemas/frm.schema"

function parseOptionalUuid(value: FormDataEntryValue | null): string | null {
  const raw = typeof value === "string" ? value.trim() : ""
  if (!raw) return null
  return raw
}

export async function createFrmAssignmentAction(
  _prev: CreateFrmAssignmentFormState | undefined,
  formData: FormData
): Promise<CreateFrmAssignmentFormState> {
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
      form: "You are not authorized to manage field assignments.",
    })
  }

  const parsed = createFrmAssignmentFormSchema.safeParse({
    employeeId: formData.get("employeeId"),
    worksiteId: formData.get("worksiteId"),
    assignmentType: formData.get("assignmentType"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || null,
    managerEmployeeId: parseOptionalUuid(formData.get("managerEmployeeId")),
    departmentRef: formData.get("departmentRef") || null,
    legalEntityRef: formData.get("legalEntityRef") || null,
    travelApprovalRef: formData.get("travelApprovalRef") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createFrmFieldAssignment({
    organizationId,
    userId,
    employeeId: parsed.data.employeeId,
    worksiteId: parsed.data.worksiteId,
    assignmentType: parsed.data.assignmentType,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate ?? null,
    managerEmployeeId: parsed.data.managerEmployeeId ?? null,
    departmentRef: parsed.data.departmentRef ?? null,
    legalEntityRef: parsed.data.legalEntityRef ?? null,
    travelApprovalRef: parsed.data.travelApprovalRef ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, assignmentId: result.assignmentId }
}
