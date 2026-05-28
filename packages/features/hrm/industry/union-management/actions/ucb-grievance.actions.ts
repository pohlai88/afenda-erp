"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import { createUcbGrievance } from "../data/ucb-grievance.server"
import {
  createGrievanceFormSchema,
  type UcbMutationFormState,
  withUcbNullableFields,
} from "../schemas/ucb.schema"

async function requireUcbManagePermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "union_collective_bargaining",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({ form: "You are not authorized to manage grievances." })
  }
  return null
}

export async function createUcbGrievanceAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createGrievanceFormSchema.safeParse({
    employeeId: formData.get("employeeId"),
    collectiveAgreementId: formData.get("collectiveAgreementId") || null,
    category: formData.get("category"),
    clauseCode: formData.get("clauseCode") || null,
    severity: formData.get("severity"),
    summary: formData.get("summary"),
    departmentRef: formData.get("departmentRef") || null,
    locationRef: formData.get("locationRef") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withUcbNullableFields(parsed.data, [
    "collectiveAgreementId",
    "clauseCode",
    "departmentRef",
    "locationRef",
  ])
  const result = await createUcbGrievance({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.grievanceId }
}
