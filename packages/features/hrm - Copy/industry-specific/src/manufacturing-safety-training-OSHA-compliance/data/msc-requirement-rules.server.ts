import "server-only"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmMscSafetyRequirementRule } from "@afenda/platform/db/schema"

import { HRM_MSC_AUDIT } from "../msc.contract"
import { recomputeMscObligationsForOrg } from "./msc-obligations.server"
import { revalidateMscSurfaces } from "./msc-revalidate.server"

function normalizeCountryCode(value: string | null | undefined): string | null {
  const trimmed = value?.trim().toUpperCase()
  if (!trimmed) return null
  if (!/^[A-Z]{2}$/.test(trimmed)) return null
  return trimmed
}

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createMscRequirementRule(input: {
  organizationId: string
  userId: string
  sessionId: string | null
  siteId: string | null
  countryCode: string | null
  legalEntityRef: string | null
  roleRef: string | null
  departmentRef: string | null
  riskCategory: string | null
  requiresMachineSafety: boolean
  requiresPpeTraining: boolean
  requiresPpeAcknowledgment: boolean
  requiresChemicalHandling: boolean
  requiresFireSafety: boolean
  requiresErgonomics: boolean
  requiresWorkplaceHazard: boolean
  requiresSafetyCertification: boolean
}): Promise<{ ok: true; ruleId: string } | { ok: false; form?: string }> {
  const countryCode = normalizeCountryCode(input.countryCode)
  if (input.countryCode?.trim() && !countryCode) {
    return {
      ok: false,
      form: "Country code must be a two-letter ISO code (e.g. US).",
    }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmMscSafetyRequirementRule).values({
    id,
    organizationId: input.organizationId,
    siteId: input.siteId,
    countryCode,
    legalEntityRef: emptyToNull(input.legalEntityRef),
    roleRef: emptyToNull(input.roleRef),
    departmentRef: emptyToNull(input.departmentRef),
    riskCategory: emptyToNull(input.riskCategory),
    requiresMachineSafety: input.requiresMachineSafety,
    requiresPpeTraining: input.requiresPpeTraining,
    requiresPpeAcknowledgment: input.requiresPpeAcknowledgment,
    requiresChemicalHandling: input.requiresChemicalHandling,
    requiresFireSafety: input.requiresFireSafety,
    requiresErgonomics: input.requiresErgonomics,
    requiresWorkplaceHazard: input.requiresWorkplaceHazard,
    requiresSafetyCertification: input.requiresSafetyCertification,
    active: true,
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.requirementRuleCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "manufacturing_safety_requirement",
    resourceId: id,
    metadata: {},
  })

  const recompute = await recomputeMscObligationsForOrg({
    organizationId: input.organizationId,
    userId: input.userId,
    sessionId: input.sessionId,
  })
  if (!recompute.ok) {
    return { ok: false, form: recompute.form }
  }

  revalidateMscSurfaces()
  return { ok: true, ruleId: id }
}
