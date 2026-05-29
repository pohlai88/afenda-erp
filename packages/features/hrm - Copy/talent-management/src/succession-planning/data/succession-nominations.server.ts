import "server-only"

import { and, asc, eq, ne } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmSuccessionCriticalRole,
  hrmSuccessionNomination,
} from "@afenda/platform/db/schema"

import { HRM_SUCCESSION_AUDIT } from "../succession.contract"
import { revalidateSuccessionSurfaces } from "./succession-revalidate.server"
import type { SuccessionNominationRow } from "./succession.types.shared"

async function candidateLabel(
  organizationId: string,
  employeeId: string
): Promise<string> {
  const row = await db.query.hrmEmployee.findFirst({
    where: and(
      eq(hrmEmployee.organizationId, organizationId),
      eq(hrmEmployee.id, employeeId)
    ),
    columns: { legalName: true, employeeNumber: true },
  })
  if (!row) return employeeId
  return `${row.employeeNumber} — ${row.legalName}`
}

export async function listSuccessionNominationsForOrg(
  organizationId: string,
  criticalRoleId?: string
): Promise<SuccessionNominationRow[]> {
  const rows = await db
    .select({
      nomination: hrmSuccessionNomination,
      roleTitle: hrmSuccessionCriticalRole.title,
    })
    .from(hrmSuccessionNomination)
    .innerJoin(
      hrmSuccessionCriticalRole,
      eq(hrmSuccessionCriticalRole.id, hrmSuccessionNomination.criticalRoleId)
    )
    .where(
      criticalRoleId
        ? and(
            eq(hrmSuccessionNomination.organizationId, organizationId),
            eq(hrmSuccessionNomination.criticalRoleId, criticalRoleId)
          )
        : eq(hrmSuccessionNomination.organizationId, organizationId)
    )
    .orderBy(asc(hrmSuccessionNomination.createdAt))

  const result: SuccessionNominationRow[] = []
  for (const row of rows) {
    const label = await candidateLabel(
      organizationId,
      row.nomination.candidateEmployeeId
    )
    result.push({
      id: row.nomination.id,
      criticalRoleId: row.nomination.criticalRoleId,
      criticalRoleTitle: row.roleTitle,
      candidateEmployeeId: row.nomination.candidateEmployeeId,
      candidateLabel: label,
      successorType:
        row.nomination.successorType as SuccessionNominationRow["successorType"],
      readinessLevel:
        row.nomination.readinessLevel as SuccessionNominationRow["readinessLevel"],
      potentialRating: row.nomination.potentialRating,
      performancePotentialGrid: row.nomination.performancePotentialGrid,
      nominationReason: row.nomination.nominationReason,
      status: row.nomination.status as SuccessionNominationRow["status"],
    })
  }
  return result
}

export async function assertNoPrimarySuccessorConflict(input: {
  organizationId: string
  criticalRoleId: string
  successorType: string
  excludeNominationId?: string
}): Promise<{ ok: true } | { ok: false; form: string }> {
  if (input.successorType !== "primary") {
    return { ok: true }
  }

  const existing = await db.query.hrmSuccessionNomination.findFirst({
    where: and(
      eq(hrmSuccessionNomination.organizationId, input.organizationId),
      eq(hrmSuccessionNomination.criticalRoleId, input.criticalRoleId),
      eq(hrmSuccessionNomination.successorType, "primary"),
      eq(hrmSuccessionNomination.status, "active"),
      input.excludeNominationId
        ? ne(hrmSuccessionNomination.id, input.excludeNominationId)
        : undefined
    ),
    columns: { id: true },
  })

  if (existing) {
    return {
      ok: false,
      form: "This critical role already has an active primary successor.",
    }
  }
  return { ok: true }
}

export async function createSuccessionNomination(input: {
  organizationId: string
  userId: string
  criticalRoleId: string
  candidateEmployeeId: string
  successorType: string
  readinessLevel: string
  potentialRating: string | null
  performancePotentialGrid: string | null
  nominationReason: string | null
}): Promise<{ ok: true; nominationId: string } | { ok: false; form?: string }> {
  const conflict = await assertNoPrimarySuccessorConflict({
    organizationId: input.organizationId,
    criticalRoleId: input.criticalRoleId,
    successorType: input.successorType,
  })
  if (!conflict.ok) {
    return { ok: false, form: conflict.form }
  }

  const nominationId = crypto.randomUUID()
  await db.insert(hrmSuccessionNomination).values({
    id: nominationId,
    organizationId: input.organizationId,
    criticalRoleId: input.criticalRoleId,
    candidateEmployeeId: input.candidateEmployeeId,
    successorType: input.successorType,
    readinessLevel: input.readinessLevel,
    potentialRating: input.potentialRating,
    performancePotentialGrid: input.performancePotentialGrid,
    nominationReason: input.nominationReason,
    status: "active",
    nominatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.nominationCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_succession_nomination",
    resourceId: nominationId,
    metadata: {
      criticalRoleId: input.criticalRoleId,
      successorType: input.successorType,
    },
  })

  revalidateSuccessionSurfaces()
  return { ok: true, nominationId }
}

export async function updateSuccessionNominationReadiness(input: {
  organizationId: string
  userId: string
  nominationId: string
  readinessLevel: string
  potentialRating: string | null
  performancePotentialGrid: string | null
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const existing = await db.query.hrmSuccessionNomination.findFirst({
    where: and(
      eq(hrmSuccessionNomination.organizationId, input.organizationId),
      eq(hrmSuccessionNomination.id, input.nominationId)
    ),
    columns: {
      id: true,
      criticalRoleId: true,
      successorType: true,
    },
  })
  if (!existing) {
    return { ok: false, form: "Nomination not found." }
  }

  await db
    .update(hrmSuccessionNomination)
    .set({
      readinessLevel: input.readinessLevel,
      potentialRating: input.potentialRating,
      performancePotentialGrid: input.performancePotentialGrid,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(hrmSuccessionNomination.id, input.nominationId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.nominationUpdate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_succession_nomination",
    resourceId: input.nominationId,
    metadata: { readinessLevel: input.readinessLevel },
  })

  revalidateSuccessionSurfaces()
  return { ok: true }
}
