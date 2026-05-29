"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import { createSuccessionDevelopmentLink } from "../data/succession-development-links.server"
import {
  addSuccessionPoolMember,
  createSuccessionTalentPool,
} from "../data/succession-pools.server"
import {
  addPoolMemberFormSchema,
  createDevelopmentLinkFormSchema,
  createTalentPoolFormSchema,
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
      form: "You are not authorized to manage talent pools.",
    })
  }
  return null
}

export async function createSuccessionTalentPoolAction(
  _prev: SuccessionMutationFormState | undefined,
  formData: FormData
): Promise<SuccessionMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireSuccessionManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createTalentPoolFormSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    poolKind: formData.get("poolKind"),
    description: formData.get("description") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withSuccessionNullableFields(parsed.data, ["description"])
  const result = await createSuccessionTalentPool({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.poolId }
}

export async function addSuccessionPoolMemberAction(
  _prev: SuccessionMutationFormState | undefined,
  formData: FormData
): Promise<SuccessionMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireSuccessionManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = addPoolMemberFormSchema.safeParse({
    poolId: formData.get("poolId"),
    employeeId: formData.get("employeeId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await addSuccessionPoolMember({
    organizationId: session.organizationId,
    userId: session.userId,
    ...parsed.data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.memberId }
}

export async function createSuccessionDevelopmentLinkAction(
  _prev: SuccessionMutationFormState | undefined,
  formData: FormData
): Promise<SuccessionMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireSuccessionManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createDevelopmentLinkFormSchema.safeParse({
    nominationId: formData.get("nominationId"),
    developmentPlanId: formData.get("developmentPlanId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createSuccessionDevelopmentLink({
    organizationId: session.organizationId,
    userId: session.userId,
    ...parsed.data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.linkId }
}
