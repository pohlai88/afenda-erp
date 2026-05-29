"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import {
  createSuccessionNomination,
  updateSuccessionNominationReadiness,
} from "../data/succession-nominations.server"
import {
  createNominationFormSchema,
  updateNominationReadinessFormSchema,
  type SuccessionMutationFormState,
  withSuccessionNullableFields,
} from "../schemas/succession.schema"

async function requireSuccessionManagePermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "succession",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage succession nominations.",
    })
  }
  return null
}

export async function createSuccessionNominationAction(
  _prev: SuccessionMutationFormState | undefined,
  formData: FormData
): Promise<SuccessionMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireSuccessionManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createNominationFormSchema.safeParse({
    criticalRoleId: formData.get("criticalRoleId"),
    candidateEmployeeId: formData.get("candidateEmployeeId"),
    successorType: formData.get("successorType"),
    readinessLevel: formData.get("readinessLevel"),
    potentialRating: formData.get("potentialRating") || null,
    performancePotentialGrid: formData.get("performancePotentialGrid") || null,
    nominationReason: formData.get("nominationReason") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withSuccessionNullableFields(parsed.data, [
    "potentialRating",
    "performancePotentialGrid",
    "nominationReason",
  ])
  const result = await createSuccessionNomination({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.nominationId }
}

export async function updateSuccessionNominationReadinessAction(
  _prev: SuccessionMutationFormState | undefined,
  formData: FormData
): Promise<SuccessionMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireSuccessionManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = updateNominationReadinessFormSchema.safeParse({
    nominationId: formData.get("nominationId"),
    readinessLevel: formData.get("readinessLevel"),
    potentialRating: formData.get("potentialRating") || null,
    performancePotentialGrid: formData.get("performancePotentialGrid") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withSuccessionNullableFields(parsed.data, [
    "potentialRating",
    "performancePotentialGrid",
  ])
  const result = await updateSuccessionNominationReadiness({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: parsed.data.nominationId }
}
