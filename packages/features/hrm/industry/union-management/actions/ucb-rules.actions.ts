"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import { createUcbCbaRule, updateUcbCbaRule } from "../data/ucb-rules.server"
import {
  createCbaRuleFormSchema,
  type UcbMutationFormState,
  updateCbaRuleFormSchema,
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
    return hrmActionFailure({ form: "You are not authorized to manage CBA rules." })
  }
  return null
}

export async function createUcbCbaRuleAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createCbaRuleFormSchema.safeParse({
    collectiveAgreementId: formData.get("collectiveAgreementId"),
    ruleDomain: formData.get("ruleDomain"),
    externalRuleCode: formData.get("externalRuleCode"),
    summary: formData.get("summary"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createUcbCbaRule({
    organizationId: session.organizationId,
    userId: session.userId,
    ...parsed.data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.cbaRuleId }
}

export async function updateUcbCbaRuleAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = updateCbaRuleFormSchema.safeParse({
    cbaRuleId: formData.get("cbaRuleId"),
    collectiveAgreementId: formData.get("collectiveAgreementId"),
    ruleDomain: formData.get("ruleDomain"),
    externalRuleCode: formData.get("externalRuleCode"),
    summary: formData.get("summary"),
    active: formData.get("active"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await updateUcbCbaRule({
    organizationId: session.organizationId,
    userId: session.userId,
    cbaRuleId: parsed.data.cbaRuleId,
    ruleDomain: parsed.data.ruleDomain,
    externalRuleCode: parsed.data.externalRuleCode,
    summary: parsed.data.summary,
    active: parsed.data.active ?? true,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true }
}
