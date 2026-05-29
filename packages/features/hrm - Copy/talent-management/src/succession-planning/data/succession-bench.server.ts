import "server-only"

import { and, asc, desc, eq, inArray } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmSuccessionCriticalRole,
  hrmSuccessionNomination,
  hrmSuccessionReplacementPlan,
  hrmSuccessionReviewCycle,
  hrmSuccessionRiskSnapshot,
} from "@afenda/platform/db/schema"

import { HRM_SUCCESSION_AUDIT } from "../succession.contract"
import { formatSuccessionDateOnly, parseSuccessionDateOnly } from "./succession-dates.shared"
import { revalidateSuccessionSurfaces } from "./succession-revalidate.server"
import type {
  SuccessionBenchStrengthRow,
  SuccessionReplacementPlanRow,
  SuccessionReviewCycleRow,
  SuccessionRiskSnapshotRow,
} from "./succession.types.shared"

const READY_NOW_LEVELS = new Set(["ready_now"])

function computeBenchScore(readyNowCount: number, nominationCount: number): number {
  if (nominationCount === 0) return 0
  return Math.round((readyNowCount / nominationCount) * 100)
}

function computeRiskLevel(input: {
  vacancyRisk: string
  readyNowCount: number
  nominationCount: number
}): "low" | "medium" | "high" | "critical" {
  if (input.readyNowCount === 0 && input.vacancyRisk === "critical") {
    return "critical"
  }
  if (input.readyNowCount === 0 && input.nominationCount === 0) {
    return "high"
  }
  if (input.readyNowCount === 0) {
    return input.vacancyRisk === "high" ? "high" : "medium"
  }
  if (input.readyNowCount >= 2) return "low"
  return "medium"
}

function buildRiskFlags(input: {
  readyNowCount: number
  nominationCount: number
}): string[] {
  const flags: string[] = []
  if (input.readyNowCount === 0) {
    flags.push("no_ready_successor")
  }
  if (input.nominationCount < 2) {
    flags.push("weak_coverage")
  }
  return flags
}

export async function listSuccessionBenchStrength(
  organizationId: string
): Promise<SuccessionBenchStrengthRow[]> {
  const roles = await db.query.hrmSuccessionCriticalRole.findMany({
    where: and(
      eq(hrmSuccessionCriticalRole.organizationId, organizationId),
      eq(hrmSuccessionCriticalRole.active, true)
    ),
    orderBy: [asc(hrmSuccessionCriticalRole.code)],
  })

  if (roles.length === 0) return []

  const roleIds = roles.map((role) => role.id)
  const nominations = await db.query.hrmSuccessionNomination.findMany({
    where: and(
      eq(hrmSuccessionNomination.organizationId, organizationId),
      inArray(hrmSuccessionNomination.criticalRoleId, roleIds),
      eq(hrmSuccessionNomination.status, "active")
    ),
  })

  const byRole = new Map<string, typeof nominations>()
  for (const nomination of nominations) {
    const list = byRole.get(nomination.criticalRoleId) ?? []
    list.push(nomination)
    byRole.set(nomination.criticalRoleId, list)
  }

  return roles.map((role) => {
    const roleNominations = byRole.get(role.id) ?? []
    const readyNowCount = roleNominations.filter((n) =>
      READY_NOW_LEVELS.has(n.readinessLevel)
    ).length
    const nominationCount = roleNominations.length
    const benchStrengthScore = computeBenchScore(readyNowCount, nominationCount)
    const riskLevel = computeRiskLevel({
      vacancyRisk: role.vacancyRisk,
      readyNowCount,
      nominationCount,
    })
  const flags = buildRiskFlags({ readyNowCount, nominationCount })

    return {
      criticalRoleId: role.id,
      criticalRoleTitle: role.title,
      leadershipLevel: role.leadershipLevel,
      jobFamilyRef: role.jobFamilyRef,
      vacancyRisk: role.vacancyRisk as SuccessionBenchStrengthRow["vacancyRisk"],
      nominationCount,
      readyNowCount,
      benchStrengthScore,
      riskLevel,
      flags,
    }
  })
}

export async function listSuccessionRiskSnapshotsForOrg(
  organizationId: string
): Promise<SuccessionRiskSnapshotRow[]> {
  const rows = await db
    .select({
      snapshot: hrmSuccessionRiskSnapshot,
      roleTitle: hrmSuccessionCriticalRole.title,
    })
    .from(hrmSuccessionRiskSnapshot)
    .innerJoin(
      hrmSuccessionCriticalRole,
      eq(hrmSuccessionCriticalRole.id, hrmSuccessionRiskSnapshot.criticalRoleId)
    )
    .where(eq(hrmSuccessionRiskSnapshot.organizationId, organizationId))
    .orderBy(desc(hrmSuccessionRiskSnapshot.computedAt))

  return rows.map((row) => {
    const flagsJson = row.snapshot.flagsJson as { flags?: string[] } | null
    return {
      id: row.snapshot.id,
      criticalRoleId: row.snapshot.criticalRoleId,
      criticalRoleTitle: row.roleTitle,
      benchStrengthScore: row.snapshot.benchStrengthScore,
      readySuccessorCount: row.snapshot.readySuccessorCount,
      riskLevel: row.snapshot.riskLevel as SuccessionRiskSnapshotRow["riskLevel"],
      flags: flagsJson?.flags ?? [],
      computedAt: row.snapshot.computedAt,
    }
  })
}

export async function computeSuccessionRiskSnapshots(input: {
  organizationId: string
  userId: string
  reviewCycleId?: string
}): Promise<number> {
  const benchRows = await listSuccessionBenchStrength(input.organizationId)
  let created = 0

  for (const row of benchRows) {
    await db.insert(hrmSuccessionRiskSnapshot).values({
      organizationId: input.organizationId,
      criticalRoleId: row.criticalRoleId,
      reviewCycleId: input.reviewCycleId ?? null,
      benchStrengthScore: row.benchStrengthScore,
      readySuccessorCount: row.readyNowCount,
      riskLevel: row.riskLevel,
      flagsJson: { flags: row.flags },
    })
    created += 1
  }

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.riskSnapshotCompute,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_succession_risk_snapshot",
    resourceId: input.reviewCycleId ?? "org-wide",
    metadata: { rowCount: created },
  })

  revalidateSuccessionSurfaces()
  return created
}

export async function listSuccessionReplacementPlansForOrg(
  organizationId: string
): Promise<SuccessionReplacementPlanRow[]> {
  const rows = await db
    .select({
      plan: hrmSuccessionReplacementPlan,
      roleTitle: hrmSuccessionCriticalRole.title,
      interimLegalName: hrmEmployee.legalName,
      interimEmployeeNumber: hrmEmployee.employeeNumber,
    })
    .from(hrmSuccessionReplacementPlan)
    .innerJoin(
      hrmSuccessionCriticalRole,
      eq(hrmSuccessionCriticalRole.id, hrmSuccessionReplacementPlan.criticalRoleId)
    )
    .leftJoin(
      hrmEmployee,
      eq(hrmEmployee.id, hrmSuccessionReplacementPlan.interimEmployeeId)
    )
    .where(eq(hrmSuccessionReplacementPlan.organizationId, organizationId))
    .orderBy(desc(hrmSuccessionReplacementPlan.createdAt))

  return rows.map((row) => ({
    id: row.plan.id,
    criticalRoleId: row.plan.criticalRoleId,
    criticalRoleTitle: row.roleTitle,
    planKind: row.plan.planKind as SuccessionReplacementPlanRow["planKind"],
    primaryNominationId: row.plan.primaryNominationId,
    interimEmployeeId: row.plan.interimEmployeeId,
    interimLabel:
      row.interimEmployeeNumber && row.interimLegalName
        ? `${row.interimEmployeeNumber} — ${row.interimLegalName}`
        : null,
    effectiveFrom: formatSuccessionDateOnly(row.plan.effectiveFrom),
    status: row.plan.status as SuccessionReplacementPlanRow["status"],
    notes: row.plan.notes,
  }))
}

export async function createSuccessionReplacementPlan(input: {
  organizationId: string
  userId: string
  criticalRoleId: string
  planKind: string
  primaryNominationId: string | null
  interimEmployeeId: string | null
  effectiveFrom: string | null
  notes: string | null
}): Promise<{ ok: true; planId: string } | { ok: false; form?: string }> {
  const planId = crypto.randomUUID()
  await db.insert(hrmSuccessionReplacementPlan).values({
    id: planId,
    organizationId: input.organizationId,
    criticalRoleId: input.criticalRoleId,
    planKind: input.planKind,
    primaryNominationId: input.primaryNominationId,
    interimEmployeeId: input.interimEmployeeId,
    effectiveFrom: parseSuccessionDateOnly(input.effectiveFrom),
    notes: input.notes,
    status: "draft",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.replacementPlanCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_succession_replacement_plan",
    resourceId: planId,
    metadata: { planKind: input.planKind },
  })

  revalidateSuccessionSurfaces()
  return { ok: true, planId }
}

export async function listSuccessionReviewCyclesForOrg(
  organizationId: string
): Promise<SuccessionReviewCycleRow[]> {
  const rows = await db.query.hrmSuccessionReviewCycle.findMany({
    where: eq(hrmSuccessionReviewCycle.organizationId, organizationId),
    orderBy: [desc(hrmSuccessionReviewCycle.createdAt)],
  })
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    cycleState: row.cycleState as SuccessionReviewCycleRow["cycleState"],
    dueDate: formatSuccessionDateOnly(row.dueDate),
    completedAt: row.completedAt,
  }))
}

export async function createSuccessionReviewCycle(input: {
  organizationId: string
  userId: string
  title: string
  dueDate: string | null
}): Promise<{ ok: true; reviewCycleId: string } | { ok: false; form?: string }> {
  const reviewCycleId = crypto.randomUUID()
  await db.insert(hrmSuccessionReviewCycle).values({
    id: reviewCycleId,
    organizationId: input.organizationId,
    title: input.title.trim(),
    cycleState: "open",
    dueDate: parseSuccessionDateOnly(input.dueDate),
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.reviewCycleCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_succession_review_cycle",
    resourceId: reviewCycleId,
    metadata: {},
  })

  revalidateSuccessionSurfaces()
  return { ok: true, reviewCycleId }
}

export async function closeSuccessionReviewCycle(input: {
  organizationId: string
  userId: string
  reviewCycleId: string
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const existing = await db.query.hrmSuccessionReviewCycle.findFirst({
    where: and(
      eq(hrmSuccessionReviewCycle.organizationId, input.organizationId),
      eq(hrmSuccessionReviewCycle.id, input.reviewCycleId)
    ),
    columns: { id: true },
  })
  if (!existing) {
    return { ok: false, form: "Review cycle not found." }
  }

  await db
    .update(hrmSuccessionReviewCycle)
    .set({
      cycleState: "closed",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(hrmSuccessionReviewCycle.id, input.reviewCycleId))

  await computeSuccessionRiskSnapshots({
    organizationId: input.organizationId,
    userId: input.userId,
    reviewCycleId: input.reviewCycleId,
  })

  revalidateSuccessionSurfaces()
  return { ok: true }
}

export async function getApprovedSuccessionRecommendationForLifecycle(input: {
  organizationId: string
  employeeId: string
  criticalRoleId?: string
}) {
  const rows = await db.query.hrmSuccessionNomination.findMany({
    where: and(
      eq(hrmSuccessionNomination.organizationId, input.organizationId),
      eq(hrmSuccessionNomination.candidateEmployeeId, input.employeeId),
      eq(hrmSuccessionNomination.status, "approved"),
      input.criticalRoleId
        ? eq(hrmSuccessionNomination.criticalRoleId, input.criticalRoleId)
        : undefined
    ),
    orderBy: [desc(hrmSuccessionNomination.updatedAt)],
    limit: 1,
  })

  const nomination = rows[0]
  if (!nomination) return null

  const role = await db.query.hrmSuccessionCriticalRole.findFirst({
    where: eq(hrmSuccessionCriticalRole.id, nomination.criticalRoleId),
    columns: { id: true, title: true },
  })
  if (!role) return null

  return {
    employeeId: nomination.candidateEmployeeId,
    criticalRoleId: role.id,
    criticalRoleTitle: role.title,
    nominationId: nomination.id,
    successorType: nomination.successorType,
    readinessLevel: nomination.readinessLevel,
    status: nomination.status,
  }
}
