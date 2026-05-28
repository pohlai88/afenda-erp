"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type { CreateMscRequirementRuleFormState } from "../data/msc-form-state.shared"
import { createMscRequirementRule } from "../data/msc-requirement-rules.server"
import { createMscRequirementRuleFormSchema } from "../schemas/msc.schema"

function parseOptionalUuid(value: FormDataEntryValue | null): string | null {
  const raw = typeof value === "string" ? value.trim() : ""
  if (!raw) return null
  return raw
}

export async function createMscRequirementRuleAction(
  _prev: CreateMscRequirementRuleFormState | undefined,
  formData: FormData
): Promise<CreateMscRequirementRuleFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId, sessionId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "manufacturing_safety",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage manufacturing safety requirement rules.",
    })
  }

  const parsed = createMscRequirementRuleFormSchema.safeParse({
    siteId: parseOptionalUuid(formData.get("siteId")),
    countryCode: formData.get("countryCode") || null,
    legalEntityRef: formData.get("legalEntityRef") || null,
    roleRef: formData.get("roleRef") || null,
    departmentRef: formData.get("departmentRef") || null,
    riskCategory: formData.get("riskCategory") || null,
    requiresMachineSafety: formData.get("requiresMachineSafety") === "on",
    requiresPpeTraining: formData.get("requiresPpeTraining") === "on",
    requiresPpeAcknowledgment:
      formData.get("requiresPpeAcknowledgment") === "on",
    requiresChemicalHandling: formData.get("requiresChemicalHandling") === "on",
    requiresFireSafety: formData.get("requiresFireSafety") === "on",
    requiresErgonomics: formData.get("requiresErgonomics") === "on",
    requiresWorkplaceHazard: formData.get("requiresWorkplaceHazard") === "on",
    requiresSafetyCertification:
      formData.get("requiresSafetyCertification") === "on",
  })

  if (!parsed.success) {
    return hrmActionFailure({
      form: parsed.error.issues[0]?.message,
    })
  }

  const result = await createMscRequirementRule({
    organizationId,
    userId,
    sessionId,
    siteId: parsed.data.siteId ?? null,
    countryCode: parsed.data.countryCode?.trim() || null,
    legalEntityRef: parsed.data.legalEntityRef?.trim() || null,
    roleRef: parsed.data.roleRef?.trim() || null,
    departmentRef: parsed.data.departmentRef?.trim() || null,
    riskCategory: parsed.data.riskCategory?.trim() || null,
    requiresMachineSafety: parsed.data.requiresMachineSafety ?? false,
    requiresPpeTraining: parsed.data.requiresPpeTraining ?? false,
    requiresPpeAcknowledgment: parsed.data.requiresPpeAcknowledgment ?? false,
    requiresChemicalHandling: parsed.data.requiresChemicalHandling ?? false,
    requiresFireSafety: parsed.data.requiresFireSafety ?? false,
    requiresErgonomics: parsed.data.requiresErgonomics ?? false,
    requiresWorkplaceHazard: parsed.data.requiresWorkplaceHazard ?? false,
    requiresSafetyCertification:
      parsed.data.requiresSafetyCertification ?? true,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, ruleId: result.ruleId }
}
