import "server-only"

import { and, eq, inArray } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmMscEmployeeObligation,
  hrmMscSafetyCertification,
  hrmMscSafetyRequirementRule,
  hrmMscTrainingCompletion,
} from "@afenda/platform/db/schema"

import {
  computeMscObligationComplianceStatus,
  deriveMscComplianceFlags,
  type MscObligationComplianceInput,
} from "./msc-compliance-status.shared"
import type { HrmMscComplianceStatus } from "../schemas/msc-workflow-state.shared"
import type { HrmMscTrainingCategory } from "../schemas/msc-workflow-state.shared"

export type MscObligationComplianceContext = MscObligationComplianceInput & {
  readonly obligationId: string
  readonly status: HrmMscComplianceStatus
  readonly flags: ReturnType<typeof deriveMscComplianceFlags>
}

export async function loadMscObligationComplianceContexts(input: {
  organizationId: string
  obligationIds: readonly string[]
}): Promise<Map<string, MscObligationComplianceContext>> {
  if (input.obligationIds.length === 0) return new Map()

  const obligations = await db.query.hrmMscEmployeeObligation.findMany({
    where: and(
      eq(hrmMscEmployeeObligation.organizationId, input.organizationId),
      inArray(hrmMscEmployeeObligation.id, [...input.obligationIds])
    ),
  })
  if (obligations.length === 0) return new Map()

  const ruleIds = [...new Set(obligations.map((row) => row.requirementRuleId))]
  const rules = await db.query.hrmMscSafetyRequirementRule.findMany({
    where: and(
      eq(hrmMscSafetyRequirementRule.organizationId, input.organizationId),
      inArray(hrmMscSafetyRequirementRule.id, ruleIds)
    ),
  })
  const ruleMap = new Map(rules.map((rule) => [rule.id, rule]))

  const [trainings, certifications] = await Promise.all([
    db.query.hrmMscTrainingCompletion.findMany({
      where: and(
        eq(hrmMscTrainingCompletion.organizationId, input.organizationId),
        inArray(hrmMscTrainingCompletion.obligationId, [...input.obligationIds])
      ),
    }),
    db.query.hrmMscSafetyCertification.findMany({
      where: and(
        eq(hrmMscSafetyCertification.organizationId, input.organizationId),
        inArray(hrmMscSafetyCertification.obligationId, [
          ...input.obligationIds,
        ])
      ),
    }),
  ])

  const trainingByObligation = new Map<string, typeof trainings>()
  for (const row of trainings) {
    const list = trainingByObligation.get(row.obligationId) ?? []
    list.push(row)
    trainingByObligation.set(row.obligationId, list)
  }
  const certByObligation = new Map(
    certifications.map((row) => [row.obligationId, row])
  )

  const contexts = new Map<string, MscObligationComplianceContext>()

  for (const obligation of obligations) {
    const rule = ruleMap.get(obligation.requirementRuleId)
    if (!rule) continue

    const obligationTrainings = trainingByObligation.get(obligation.id) ?? []
    const trainingMap: Partial<
      Record<
        HrmMscTrainingCategory,
        MscObligationComplianceInput["trainings"][HrmMscTrainingCategory]
      >
    > = {}
    for (const row of obligationTrainings) {
      const category = row.trainingCategory as HrmMscTrainingCategory
      trainingMap[category] = {
        completionStatus: row.completionStatus,
        completedAt: row.completedAt,
        ppeAcknowledged: row.ppeAcknowledged,
      }
    }

    const cert = certByObligation.get(obligation.id)
    const complianceInput: MscObligationComplianceInput = {
      needs: {
        requiresMachineSafety: rule.requiresMachineSafety,
        requiresPpeTraining: rule.requiresPpeTraining,
        requiresPpeAcknowledgment: rule.requiresPpeAcknowledgment,
        requiresChemicalHandling: rule.requiresChemicalHandling,
        requiresFireSafety: rule.requiresFireSafety,
        requiresErgonomics: rule.requiresErgonomics,
        requiresWorkplaceHazard: rule.requiresWorkplaceHazard,
        requiresSafetyCertification: rule.requiresSafetyCertification,
      },
      trainings: trainingMap,
      certification: cert
        ? { certStatus: cert.certStatus, expiryDate: cert.expiryDate }
        : null,
      waived: obligation.complianceStatus === "waived",
    }

    const status = computeMscObligationComplianceStatus(complianceInput)
    contexts.set(obligation.id, {
      ...complianceInput,
      obligationId: obligation.id,
      status,
      flags: deriveMscComplianceFlags({ ...complianceInput, status }),
    })
  }

  return contexts
}

export async function refreshMscObligationComplianceStatus(input: {
  organizationId: string
  obligationId: string
}): Promise<HrmMscComplianceStatus | null> {
  const contexts = await loadMscObligationComplianceContexts({
    organizationId: input.organizationId,
    obligationIds: [input.obligationId],
  })
  const ctx = contexts.get(input.obligationId)
  if (!ctx) return null

  const computedAt = new Date()
  await db
    .update(hrmMscEmployeeObligation)
    .set({
      complianceStatus: ctx.status,
      computedAt,
      updatedAt: computedAt,
    })
    .where(eq(hrmMscEmployeeObligation.id, input.obligationId))

  return ctx.status
}

export async function refreshAllMscObligationStatusesForOrg(
  organizationId: string
): Promise<void> {
  const obligations = await db.query.hrmMscEmployeeObligation.findMany({
    where: eq(hrmMscEmployeeObligation.organizationId, organizationId),
    columns: { id: true },
  })
  if (obligations.length === 0) return

  const contexts = await loadMscObligationComplianceContexts({
    organizationId,
    obligationIds: obligations.map((row) => row.id),
  })
  const computedAt = new Date()

  for (const [obligationId, ctx] of contexts) {
    await db
      .update(hrmMscEmployeeObligation)
      .set({
        complianceStatus: ctx.status,
        computedAt,
        updatedAt: computedAt,
      })
      .where(eq(hrmMscEmployeeObligation.id, obligationId))
  }
}
