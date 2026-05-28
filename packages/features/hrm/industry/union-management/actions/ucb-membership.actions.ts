"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import {
  createUcbMembership,
  updateUcbMembership,
} from "../data/ucb-membership.server"
import {
  createMembershipFormSchema,
  type UcbMutationFormState,
  updateMembershipFormSchema,
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
    return hrmActionFailure({
      form: "You are not authorized to manage union membership.",
    })
  }
  return null
}

export async function createUcbMembershipAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createMembershipFormSchema.safeParse({
    employeeId: formData.get("employeeId"),
    unionId: formData.get("unionId"),
    bargainingUnitId: formData.get("bargainingUnitId") || null,
    status: formData.get("status"),
    membershipStartDate: formData.get("membershipStartDate") || null,
    membershipEndDate: formData.get("membershipEndDate") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withUcbNullableFields(parsed.data, [
    "bargainingUnitId",
    "membershipStartDate",
    "membershipEndDate",
  ])
  const result = await createUcbMembership({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.membershipId }
}

export async function updateUcbMembershipAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = updateMembershipFormSchema.safeParse({
    membershipId: formData.get("membershipId"),
    employeeId: formData.get("employeeId"),
    unionId: formData.get("unionId"),
    bargainingUnitId: formData.get("bargainingUnitId") || null,
    status: formData.get("status"),
    membershipStartDate: formData.get("membershipStartDate") || null,
    membershipEndDate: formData.get("membershipEndDate") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withUcbNullableFields(parsed.data, [
    "bargainingUnitId",
    "membershipStartDate",
    "membershipEndDate",
  ])
  const result = await updateUcbMembership({
    organizationId: session.organizationId,
    userId: session.userId,
    membershipId: data.membershipId,
    bargainingUnitId: data.bargainingUnitId,
    status: data.status,
    membershipStartDate: data.membershipStartDate,
    membershipEndDate: data.membershipEndDate,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true }
}
