"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type {
  CreateFhcRequirementRuleFormState,
  RecomputeFhcObligationsFormState,
} from "../../../_core/shared"
import { recomputeFhcObligationsForOrg } from "../data/fhc-obligations.server"
import { createFhcRequirementRule } from "../data/fhc-requirement-rules.server"
import { createFhcRequirementRuleFormSchema } from "../schemas/fhc.schema"

function parseOptionalUuid(value: FormDataEntryValue | null): string | null {
  const raw = typeof value === "string" ? value.trim() : ""
  if (!raw) return null
  return raw
}

export async function createFhcRequirementRuleAction(
  _prev: CreateFhcRequirementRuleFormState | undefined,
  formData: FormData
): Promise<CreateFhcRequirementRuleFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId, sessionId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "food_handler_compliance",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage food handler requirement rules.",
    })
  }

  const parsed = createFhcRequirementRuleFormSchema.safeParse({
    outletId: parseOptionalUuid(formData.get("outletId")),
    countryCode: formData.get("countryCode") || null,
    legalEntityRef: formData.get("legalEntityRef") || null,
    roleRef: formData.get("roleRef") || null,
    departmentRef: formData.get("departmentRef") || null,
    employeeCategoryRef: formData.get("employeeCategoryRef") || null,
    requiresPermit: formData.get("requiresPermit") === "on",
    requiresHygieneTraining: formData.get("requiresHygieneTraining") === "on",
    requiresAllergenTraining: formData.get("requiresAllergenTraining") === "on",
    requiresHealthCertificate:
      formData.get("requiresHealthCertificate") === "on",
  })

  if (!parsed.success) {
    return hrmActionFailure({
      form: parsed.error.issues[0]?.message,
    })
  }

  const result = await createFhcRequirementRule({
    organizationId,
    userId,
    sessionId,
    outletId: parsed.data.outletId ?? null,
    countryCode: parsed.data.countryCode?.trim() || null,
    legalEntityRef: parsed.data.legalEntityRef?.trim() || null,
    roleRef: parsed.data.roleRef?.trim() || null,
    departmentRef: parsed.data.departmentRef?.trim() || null,
    employeeCategoryRef: parsed.data.employeeCategoryRef?.trim() || null,
    requiresPermit: parsed.data.requiresPermit ?? true,
    requiresHygieneTraining: parsed.data.requiresHygieneTraining ?? true,
    requiresAllergenTraining: parsed.data.requiresAllergenTraining ?? false,
    requiresHealthCertificate: parsed.data.requiresHealthCertificate ?? false,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, ruleId: result.ruleId }
}

export async function recomputeFhcObligationsAction(
  _prev: RecomputeFhcObligationsFormState | undefined
): Promise<RecomputeFhcObligationsFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId, sessionId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "food_handler_compliance",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to recompute food handler obligations.",
    })
  }

  const result = await recomputeFhcObligationsForOrg({
    organizationId,
    userId,
    sessionId,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return {
    ok: true,
    created: result.created,
    updated: result.updated,
    removed: result.removed,
  }
}
