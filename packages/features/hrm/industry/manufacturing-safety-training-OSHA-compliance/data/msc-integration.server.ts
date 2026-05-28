import "server-only"

import { and, eq, isNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmMscEmployeeObligation, hrmMscWorkRestriction } from "@afenda/platform/db/schema"

import { isEligibleForSafetyWorkFromComplianceStatus } from "./msc-compliance-status.shared"
import { loadMscObligationComplianceContexts } from "./msc-compliance-context.server"
import type { HrmMscComplianceStatus } from "../schemas/msc-workflow-state.shared"
import type { HrmMscTrainingCategory } from "../schemas/msc-workflow-state.shared"

export type MscSafetyEligibilityForScheduling = {
  readonly eligible: boolean
  readonly status: HrmMscComplianceStatus
  readonly restrictionActive: boolean
  readonly evaluatedAt: string
}

export type MscSafetyTrainingCompletionRow = {
  readonly trainingCategory: HrmMscTrainingCategory
  readonly completed: boolean
  readonly completedAt: string | null
  readonly overdue: boolean
}

export type MscLearningRequirementRow = {
  readonly requirementCode: string
  readonly trainingCategory: HrmMscTrainingCategory
  readonly courseCode: string | null
  readonly dueDate: string | null
}

/**
 * HRM-MSC-026 — Shift Scheduling integration door.
 */
export async function getMscSafetyEligibilityForScheduling(input: {
  organizationId: string
  employeeId: string
  asOfDate?: string
}): Promise<MscSafetyEligibilityForScheduling> {
  const asOf = input.asOfDate ? new Date(input.asOfDate) : new Date()

  const activeRestriction = await db.query.hrmMscWorkRestriction.findFirst({
    where: and(
      eq(hrmMscWorkRestriction.organizationId, input.organizationId),
      eq(hrmMscWorkRestriction.employeeId, input.employeeId),
      isNull(hrmMscWorkRestriction.effectiveTo)
    ),
    columns: { id: true },
  })

  const obligations = await db.query.hrmMscEmployeeObligation.findMany({
    where: and(
      eq(hrmMscEmployeeObligation.organizationId, input.organizationId),
      eq(hrmMscEmployeeObligation.employeeId, input.employeeId)
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

  const contexts = await loadMscObligationComplianceContexts({
    organizationId: input.organizationId,
    obligationIds: obligations.map((row) => row.id),
  })

  let worst: HrmMscComplianceStatus = "compliant"
  const rank: Record<HrmMscComplianceStatus, number> = {
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
    !activeRestriction && isEligibleForSafetyWorkFromComplianceStatus(worst)

  return {
    eligible,
    status: worst,
    restrictionActive: Boolean(activeRestriction),
    evaluatedAt: asOf.toISOString(),
  }
}

/**
 * HRM-MSC-024 — Compliance & Regulatory Tracking integration door.
 */
export async function getMscSafetyTrainingForCompliance(input: {
  organizationId: string
  employeeId: string
}): Promise<readonly MscSafetyTrainingCompletionRow[]> {
  const obligations = await db.query.hrmMscEmployeeObligation.findMany({
    where: and(
      eq(hrmMscEmployeeObligation.organizationId, input.organizationId),
      eq(hrmMscEmployeeObligation.employeeId, input.employeeId)
    ),
    columns: { id: true },
  })
  if (obligations.length === 0) return []

  const contexts = await loadMscObligationComplianceContexts({
    organizationId: input.organizationId,
    obligationIds: obligations.map((row) => row.id),
  })

  const rows: MscSafetyTrainingCompletionRow[] = []
  const categories: HrmMscTrainingCategory[] = [
    "machine_safety",
    "ppe",
    "chemical",
    "fire",
    "ergonomics",
    "workplace_hazard",
  ]

  for (const ctx of contexts.values()) {
    for (const category of categories) {
      const needKey =
        category === "machine_safety"
          ? "requiresMachineSafety"
          : category === "ppe"
            ? "requiresPpeTraining"
            : category === "chemical"
              ? "requiresChemicalHandling"
              : category === "fire"
                ? "requiresFireSafety"
                : category === "ergonomics"
                  ? "requiresErgonomics"
                  : "requiresWorkplaceHazard"
      if (!ctx.needs[needKey]) continue
      const snapshot = ctx.trainings[category]
      rows.push({
        trainingCategory: category,
        completed: Boolean(snapshot?.completedAt),
        completedAt: snapshot?.completedAt?.toISOString() ?? null,
        overdue: ctx.flags.missingMandatoryTraining && !snapshot?.completedAt,
      })
    }
  }

  return rows
}

/**
 * HRM-MSC-025 — Training / LMS learning requirement export.
 */
export async function listMscLearningRequirements(input: {
  organizationId: string
  employeeId?: string
}): Promise<readonly MscLearningRequirementRow[]> {
  const employeeFilter = input.employeeId
    ? eq(hrmMscEmployeeObligation.employeeId, input.employeeId)
    : undefined

  const obligations = await db.query.hrmMscEmployeeObligation.findMany({
    where: and(
      eq(hrmMscEmployeeObligation.organizationId, input.organizationId),
      employeeFilter
    ),
    columns: { id: true },
  })
  if (obligations.length === 0) return []

  const contexts = await loadMscObligationComplianceContexts({
    organizationId: input.organizationId,
    obligationIds: obligations.map((row) => row.id),
  })

  const requirements: MscLearningRequirementRow[] = []
  const courseByCategory: Record<HrmMscTrainingCategory, string> = {
    machine_safety: "msc-machine-safety",
    ppe: "msc-ppe",
    chemical: "msc-chemical",
    fire: "msc-fire-safety",
    ergonomics: "msc-ergonomics",
    workplace_hazard: "msc-workplace-hazard",
    lockout_tagout: "msc-lockout-tagout",
    emergency_response: "msc-emergency",
  }

  for (const obligation of obligations) {
    const ctx = contexts.get(obligation.id)
    if (!ctx) continue
    for (const [category, courseCode] of Object.entries(courseByCategory)) {
      const cat = category as HrmMscTrainingCategory
      const needKey =
        cat === "machine_safety"
          ? "requiresMachineSafety"
          : cat === "ppe"
            ? "requiresPpeTraining"
            : cat === "chemical"
              ? "requiresChemicalHandling"
              : cat === "fire"
                ? "requiresFireSafety"
                : cat === "ergonomics"
                  ? "requiresErgonomics"
                  : cat === "workplace_hazard"
                    ? "requiresWorkplaceHazard"
                    : null
      if (!needKey || !ctx.needs[needKey]) continue
      if (ctx.trainings[cat]?.completedAt) continue
      requirements.push({
        requirementCode: `HRM-MSC-003:${obligation.id}:${cat}`,
        trainingCategory: cat,
        courseCode,
        dueDate: null,
      })
    }
  }

  return requirements
}
