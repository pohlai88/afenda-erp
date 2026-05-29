import "server-only"

import { and, eq, inArray } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmFhcEmployeeObligation,
  hrmFhcFoodHandlerPermit,
  hrmFhcHealthCertificate,
  hrmFhcRequirementRule,
  hrmFhcTrainingCompletion,
  hrmFhcVerificationReview,
} from "@afenda/platform/db/schema"

import {
  computeFhcObligationComplianceStatus,
  deriveFhcComplianceFlags,
  type FhcObligationComplianceInput,
} from "./fhc-compliance-status.shared"
import {
  syncFhcHealthRenewalStateForObligation,
  syncFhcPermitRenewalStateForObligation,
} from "./fhc-renewal.server"
import type { HrmFhcComplianceStatus } from "../schemas/fhc-workflow-state.shared"

export type FhcObligationComplianceContext = FhcObligationComplianceInput & {
  readonly obligationId: string
  readonly status: HrmFhcComplianceStatus
  readonly flags: ReturnType<typeof deriveFhcComplianceFlags>
}

export async function loadFhcObligationComplianceContexts(input: {
  organizationId: string
  obligationIds: readonly string[]
}): Promise<Map<string, FhcObligationComplianceContext>> {
  if (input.obligationIds.length === 0) return new Map()

  const obligations = await db.query.hrmFhcEmployeeObligation.findMany({
    where: and(
      eq(hrmFhcEmployeeObligation.organizationId, input.organizationId),
      inArray(hrmFhcEmployeeObligation.id, [...input.obligationIds])
    ),
  })
  if (obligations.length === 0) return new Map()

  const ruleIds = [...new Set(obligations.map((row) => row.requirementRuleId))]
  const rules = await db.query.hrmFhcRequirementRule.findMany({
    where: and(
      eq(hrmFhcRequirementRule.organizationId, input.organizationId),
      inArray(hrmFhcRequirementRule.id, ruleIds)
    ),
  })
  const ruleMap = new Map(rules.map((rule) => [rule.id, rule]))

  const [permits, trainings, healthCerts, reviews] = await Promise.all([
    db.query.hrmFhcFoodHandlerPermit.findMany({
      where: and(
        eq(hrmFhcFoodHandlerPermit.organizationId, input.organizationId),
        inArray(hrmFhcFoodHandlerPermit.obligationId, [...input.obligationIds])
      ),
    }),
    db.query.hrmFhcTrainingCompletion.findMany({
      where: and(
        eq(hrmFhcTrainingCompletion.organizationId, input.organizationId),
        inArray(hrmFhcTrainingCompletion.obligationId, [...input.obligationIds])
      ),
    }),
    db.query.hrmFhcHealthCertificate.findMany({
      where: and(
        eq(hrmFhcHealthCertificate.organizationId, input.organizationId),
        inArray(hrmFhcHealthCertificate.obligationId, [...input.obligationIds])
      ),
    }),
    db.query.hrmFhcVerificationReview.findMany({
      where: and(
        eq(hrmFhcVerificationReview.organizationId, input.organizationId),
        eq(hrmFhcVerificationReview.subjectKind, "obligation"),
        inArray(hrmFhcVerificationReview.subjectId, [...input.obligationIds])
      ),
    }),
  ])

  const permitByObligation = new Map(
    permits.map((row) => [row.obligationId, row])
  )
  const healthByObligation = new Map(
    healthCerts.map((row) => [row.obligationId, row])
  )
  const trainingByObligation = new Map<string, typeof trainings>()
  for (const row of trainings) {
    const list = trainingByObligation.get(row.obligationId) ?? []
    list.push(row)
    trainingByObligation.set(row.obligationId, list)
  }
  const rejectedObligations = new Set(
    reviews
      .filter((row) => row.verificationState === "rejected")
      .map((row) => row.subjectId)
  )

  const contexts = new Map<string, FhcObligationComplianceContext>()

  for (const obligation of obligations) {
    const rule = ruleMap.get(obligation.requirementRuleId)
    if (!rule) continue

    const permit = permitByObligation.get(obligation.id)
    const obligationTrainings = trainingByObligation.get(obligation.id) ?? []
    const hygiene = obligationTrainings.find(
      (row) => row.trainingType === "hygiene"
    )
    const allergen = obligationTrainings.find(
      (row) => row.trainingType === "allergen"
    )
    const health = healthByObligation.get(obligation.id)

    const complianceInput: FhcObligationComplianceInput = {
      needs: {
        requiresPermit: rule.requiresPermit,
        requiresHygieneTraining: rule.requiresHygieneTraining,
        requiresAllergenTraining: rule.requiresAllergenTraining,
        requiresHealthCertificate: rule.requiresHealthCertificate,
      },
      permit: permit
        ? {
            permitNumber: permit.permitNumber,
            permitStatus: permit.permitStatus,
            expiryDate: permit.expiryDate,
          }
        : null,
      hygieneTraining: hygiene ? { completedAt: hygiene.completedAt } : null,
      allergenTraining: allergen ? { completedAt: allergen.completedAt } : null,
      healthCertificate: health
        ? {
            healthStatus: health.healthStatus,
            expiresAt: health.expiresAt,
          }
        : null,
      verificationRejected: rejectedObligations.has(obligation.id),
      waived: obligation.complianceStatus === "waived",
    }

    const status = computeFhcObligationComplianceStatus(complianceInput)
    contexts.set(obligation.id, {
      ...complianceInput,
      obligationId: obligation.id,
      status,
      flags: deriveFhcComplianceFlags({ ...complianceInput, status }),
    })
  }

  return contexts
}

export async function refreshFhcObligationComplianceStatus(input: {
  organizationId: string
  obligationId: string
}): Promise<HrmFhcComplianceStatus | null> {
  const contexts = await loadFhcObligationComplianceContexts({
    organizationId: input.organizationId,
    obligationIds: [input.obligationId],
  })
  const ctx = contexts.get(input.obligationId)
  if (!ctx) return null

  const computedAt = new Date()
  await db
    .update(hrmFhcEmployeeObligation)
    .set({
      complianceStatus: ctx.status,
      computedAt,
      updatedAt: computedAt,
    })
    .where(eq(hrmFhcEmployeeObligation.id, input.obligationId))

  await syncFhcPermitRenewalStateForObligation({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
    complianceStatus: ctx.status,
  })

  await syncFhcHealthRenewalStateForObligation({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
    complianceStatus: ctx.status,
  })

  return ctx.status
}

export async function refreshAllFhcObligationStatusesForOrg(
  organizationId: string
): Promise<number> {
  const obligations = await db.query.hrmFhcEmployeeObligation.findMany({
    where: eq(hrmFhcEmployeeObligation.organizationId, organizationId),
    columns: { id: true },
  })
  if (obligations.length === 0) return 0

  const contexts = await loadFhcObligationComplianceContexts({
    organizationId,
    obligationIds: obligations.map((row) => row.id),
  })

  const computedAt = new Date()
  for (const [obligationId, ctx] of contexts) {
    await db
      .update(hrmFhcEmployeeObligation)
      .set({
        complianceStatus: ctx.status,
        computedAt,
        updatedAt: computedAt,
      })
      .where(eq(hrmFhcEmployeeObligation.id, obligationId))
  }

  return contexts.size
}
