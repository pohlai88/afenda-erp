import "server-only"

import { and, eq, isNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmFhcDutyRestriction,
  hrmFhcEmployeeObligation,
} from "@afenda/platform/db/schema"

import { isEligibleForFoodHandlingFromComplianceStatus } from "./fhc-compliance-status.shared"
import { loadFhcObligationComplianceContexts } from "./fhc-compliance-context.server"
import type { HrmFhcComplianceStatus } from "../schemas/fhc-workflow-state.shared"

export type FoodHandlingEligibilityForScheduling = {
  readonly eligible: boolean
  readonly status: HrmFhcComplianceStatus
  readonly restrictionActive: boolean
  readonly evaluatedAt: string
}

export type FhcMandatoryTrainingCompletionRow = {
  readonly trainingType: "hygiene" | "allergen"
  readonly completed: boolean
  readonly completedAt: string | null
  readonly overdue: boolean
}

export type FhcLearningRequirementRow = {
  readonly requirementCode: string
  readonly trainingType: "hygiene" | "allergen"
  readonly courseCode: string | null
  readonly dueDate: string | null
}

/**
 * HRM-FHC-019 — Shift Scheduling integration door.
 */
export async function getFoodHandlingEligibilityForScheduling(input: {
  organizationId: string
  employeeId: string
  asOfDate?: string
}): Promise<FoodHandlingEligibilityForScheduling> {
  const asOf = input.asOfDate ? new Date(input.asOfDate) : new Date()

  const activeRestriction = await db.query.hrmFhcDutyRestriction.findFirst({
    where: and(
      eq(hrmFhcDutyRestriction.organizationId, input.organizationId),
      eq(hrmFhcDutyRestriction.employeeId, input.employeeId),
      isNull(hrmFhcDutyRestriction.effectiveTo)
    ),
    columns: { id: true },
  })

  const obligations = await db.query.hrmFhcEmployeeObligation.findMany({
    where: and(
      eq(hrmFhcEmployeeObligation.organizationId, input.organizationId),
      eq(hrmFhcEmployeeObligation.employeeId, input.employeeId)
    ),
    columns: { id: true },
  })

  if (obligations.length === 0) {
    return {
      eligible: !activeRestriction,
      status: "not_required",
      restrictionActive: Boolean(activeRestriction),
      evaluatedAt: asOf.toISOString(),
    }
  }

  const contexts = await loadFhcObligationComplianceContexts({
    organizationId: input.organizationId,
    obligationIds: obligations.map((row) => row.id),
  })

  let worst: HrmFhcComplianceStatus = "compliant"
  const rank: Record<HrmFhcComplianceStatus, number> = {
    compliant: 0,
    waived: 0,
    not_required: 0,
    pending: 1,
    expiring: 2,
    missing: 3,
    expired: 4,
    rejected: 5,
  }

  for (const ctx of contexts.values()) {
    if (rank[ctx.status] > rank[worst]) {
      worst = ctx.status
    }
  }

  const eligible =
    !activeRestriction && isEligibleForFoodHandlingFromComplianceStatus(worst)

  return {
    eligible,
    status: worst,
    restrictionActive: Boolean(activeRestriction),
    evaluatedAt: asOf.toISOString(),
  }
}

/**
 * HRM-FHC-020 — Compliance & Regulatory Tracking integration door.
 */
export async function getFhcMandatoryTrainingForCompliance(input: {
  organizationId: string
  employeeId: string
}): Promise<readonly FhcMandatoryTrainingCompletionRow[]> {
  const obligations = await db.query.hrmFhcEmployeeObligation.findMany({
    where: and(
      eq(hrmFhcEmployeeObligation.organizationId, input.organizationId),
      eq(hrmFhcEmployeeObligation.employeeId, input.employeeId)
    ),
    columns: { id: true },
  })
  if (obligations.length === 0) return []

  const contexts = await loadFhcObligationComplianceContexts({
    organizationId: input.organizationId,
    obligationIds: obligations.map((row) => row.id),
  })

  const rows: FhcMandatoryTrainingCompletionRow[] = []
  for (const ctx of contexts.values()) {
    if (ctx.needs.requiresHygieneTraining) {
      rows.push({
        trainingType: "hygiene",
        completed: Boolean(ctx.hygieneTraining?.completedAt),
        completedAt: ctx.hygieneTraining?.completedAt?.toISOString() ?? null,
        overdue: ctx.flags.overdueTraining && !ctx.hygieneTraining?.completedAt,
      })
    }
    if (ctx.needs.requiresAllergenTraining) {
      rows.push({
        trainingType: "allergen",
        completed: Boolean(ctx.allergenTraining?.completedAt),
        completedAt: ctx.allergenTraining?.completedAt?.toISOString() ?? null,
        overdue:
          ctx.flags.overdueTraining && !ctx.allergenTraining?.completedAt,
      })
    }
  }

  return rows
}

/**
 * HRM-FHC-021 — Training / LMS learning requirement export.
 */
export async function listFhcLearningRequirementsForTraining(input: {
  organizationId: string
  employeeId?: string
}): Promise<readonly FhcLearningRequirementRow[]> {
  const employeeFilter = input.employeeId
    ? eq(hrmFhcEmployeeObligation.employeeId, input.employeeId)
    : undefined

  const obligations = await db.query.hrmFhcEmployeeObligation.findMany({
    where: and(
      eq(hrmFhcEmployeeObligation.organizationId, input.organizationId),
      employeeFilter
    ),
    columns: { id: true, employeeId: true },
  })
  if (obligations.length === 0) return []

  const contexts = await loadFhcObligationComplianceContexts({
    organizationId: input.organizationId,
    obligationIds: obligations.map((row) => row.id),
  })

  const requirements: FhcLearningRequirementRow[] = []
  for (const obligation of obligations) {
    const ctx = contexts.get(obligation.id)
    if (!ctx) continue
    if (
      ctx.needs.requiresHygieneTraining &&
      !ctx.hygieneTraining?.completedAt
    ) {
      requirements.push({
        requirementCode: `HRM-FHC-004:${obligation.id}`,
        trainingType: "hygiene",
        courseCode: "food-hygiene",
        dueDate: null,
      })
    }
    if (
      ctx.needs.requiresAllergenTraining &&
      !ctx.allergenTraining?.completedAt
    ) {
      requirements.push({
        requirementCode: `HRM-FHC-005:${obligation.id}`,
        trainingType: "allergen",
        courseCode: "allergen-awareness",
        dueDate: null,
      })
    }
  }

  return requirements
}
