import "server-only"

import { eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmFhcRequirementRule } from "@afenda/platform/db/schema"

import { HRM_FHC_AUDIT } from "../fhc.contract"
import { recomputeFhcObligationsForOrg } from "./fhc-obligations.server"
import { revalidateFhcSurfaces } from "./fhc-revalidate.server"

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

export async function createFhcRequirementRule(input: {
  organizationId: string
  userId: string
  sessionId: string | null
  outletId: string | null
  countryCode: string | null
  legalEntityRef: string | null
  roleRef: string | null
  departmentRef: string | null
  employeeCategoryRef: string | null
  requiresPermit: boolean
  requiresHygieneTraining: boolean
  requiresAllergenTraining: boolean
  requiresHealthCertificate: boolean
}): Promise<{ ok: true; ruleId: string } | { ok: false; form?: string }> {
  const countryCode = normalizeCountryCode(input.countryCode)
  if (input.countryCode?.trim() && !countryCode) {
    return {
      ok: false,
      form: "Country code must be a two-letter ISO code (e.g. MY).",
    }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmFhcRequirementRule).values({
    id,
    organizationId: input.organizationId,
    outletId: input.outletId,
    countryCode,
    legalEntityRef: emptyToNull(input.legalEntityRef),
    roleRef: emptyToNull(input.roleRef),
    departmentRef: emptyToNull(input.departmentRef),
    employeeCategoryRef: emptyToNull(input.employeeCategoryRef),
    requiresPermit: input.requiresPermit,
    requiresHygieneTraining: input.requiresHygieneTraining,
    requiresAllergenTraining: input.requiresAllergenTraining,
    requiresHealthCertificate: input.requiresHealthCertificate,
    active: true,
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.requirementRuleCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_requirement",
    resourceId: id,
    metadata: {},
  })

  const recompute = await recomputeFhcObligationsForOrg({
    organizationId: input.organizationId,
    userId: input.userId,
    sessionId: input.sessionId,
  })
  if (!recompute.ok) {
    return { ok: false, form: recompute.form }
  }

  revalidateFhcSurfaces()
  return { ok: true, ruleId: id }
}

export async function setFhcRequirementRuleActive(input: {
  organizationId: string
  userId: string
  sessionId: string | null
  ruleId: string
  active: boolean
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const rule = await db.query.hrmFhcRequirementRule.findFirst({
    where: eq(hrmFhcRequirementRule.id, input.ruleId),
    columns: { id: true, organizationId: true },
  })
  if (!rule || rule.organizationId !== input.organizationId) {
    return { ok: false, form: "Requirement rule was not found." }
  }

  await db
    .update(hrmFhcRequirementRule)
    .set({
      active: input.active,
      updatedByUserId: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(hrmFhcRequirementRule.id, input.ruleId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.requirementRuleUpdate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_requirement",
    resourceId: input.ruleId,
    metadata: { active: input.active },
  })

  const recompute = await recomputeFhcObligationsForOrg({
    organizationId: input.organizationId,
    userId: input.userId,
    sessionId: input.sessionId,
  })
  if (!recompute.ok) {
    return { ok: false, form: recompute.form }
  }

  revalidateFhcSurfaces()
  return { ok: true }
}
