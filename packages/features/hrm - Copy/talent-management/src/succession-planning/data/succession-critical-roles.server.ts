import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmEmployee, hrmSuccessionCriticalRole } from "@afenda/platform/db/schema"

import { HRM_SUCCESSION_AUDIT } from "../succession.contract"
import { revalidateSuccessionSurfaces } from "./succession-revalidate.server"
import type {
  SuccessionCriticalRoleChoiceRow,
  SuccessionCriticalRoleRow,
} from "./succession.types.shared"

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

async function employeeLabel(
  organizationId: string,
  employeeId: string | null
): Promise<string | null> {
  if (!employeeId) return null
  const row = await db.query.hrmEmployee.findFirst({
    where: and(
      eq(hrmEmployee.organizationId, organizationId),
      eq(hrmEmployee.id, employeeId)
    ),
    columns: { legalName: true, employeeNumber: true },
  })
  if (!row) return null
  return `${row.employeeNumber} — ${row.legalName}`
}

function mapCriticalRoleRow(
  row: typeof hrmSuccessionCriticalRole.$inferSelect,
  incumbentLabel: string | null
): SuccessionCriticalRoleRow {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    businessImpact: row.businessImpact as SuccessionCriticalRoleRow["businessImpact"],
    leadershipLevel: row.leadershipLevel,
    vacancyRisk: row.vacancyRisk as SuccessionCriticalRoleRow["vacancyRisk"],
    replacementDifficulty: row.replacementDifficulty,
    orgUnitId: row.orgUnitId,
    positionId: row.positionId,
    jobFamilyRef: row.jobFamilyRef,
    gradeRef: row.gradeRef,
    incumbentEmployeeId: row.incumbentEmployeeId,
    incumbentLabel,
    active: row.active,
    notes: row.notes,
  }
}

export async function listSuccessionCriticalRolesForOrg(
  organizationId: string
): Promise<SuccessionCriticalRoleRow[]> {
  const rows = await db.query.hrmSuccessionCriticalRole.findMany({
    where: eq(hrmSuccessionCriticalRole.organizationId, organizationId),
    orderBy: [asc(hrmSuccessionCriticalRole.code)],
  })

  const result: SuccessionCriticalRoleRow[] = []
  for (const row of rows) {
    const label = await employeeLabel(organizationId, row.incumbentEmployeeId)
    result.push(mapCriticalRoleRow(row, label))
  }
  return result
}

export async function listSuccessionCriticalRoleChoicesForOrg(
  organizationId: string
): Promise<SuccessionCriticalRoleChoiceRow[]> {
  const rows = await listSuccessionCriticalRolesForOrg(organizationId)
  return rows
    .filter((row) => row.active)
    .map((row) => ({
      id: row.id,
      label: `${row.code} — ${row.title}`,
    }))
}

export async function createSuccessionCriticalRole(input: {
  organizationId: string
  userId: string
  code: string
  title: string
  businessImpact: string
  leadershipLevel: string
  vacancyRisk: string
  replacementDifficulty: string
  orgUnitId: string | null
  positionId: string | null
  jobFamilyRef: string | null
  gradeRef: string | null
  incumbentEmployeeId: string | null
  notes: string | null
}): Promise<{ ok: true; criticalRoleId: string } | { ok: false; form?: string }> {
  const code = input.code.trim().toUpperCase()
  if (!code) {
    return { ok: false, form: "Role code is required." }
  }

  const existing = await db.query.hrmSuccessionCriticalRole.findFirst({
    where: and(
      eq(hrmSuccessionCriticalRole.organizationId, input.organizationId),
      eq(hrmSuccessionCriticalRole.code, code)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "A critical role with this code already exists." }
  }

  const criticalRoleId = crypto.randomUUID()
  await db.insert(hrmSuccessionCriticalRole).values({
    id: criticalRoleId,
    organizationId: input.organizationId,
    code,
    title: input.title.trim(),
    businessImpact: input.businessImpact,
    leadershipLevel: input.leadershipLevel.trim(),
    vacancyRisk: input.vacancyRisk,
    replacementDifficulty: input.replacementDifficulty.trim(),
    orgUnitId: emptyToNull(input.orgUnitId),
    positionId: emptyToNull(input.positionId),
    jobFamilyRef: emptyToNull(input.jobFamilyRef),
    gradeRef: emptyToNull(input.gradeRef),
    incumbentEmployeeId: emptyToNull(input.incumbentEmployeeId),
    notes: emptyToNull(input.notes),
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.criticalRoleCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_succession_critical_role",
    resourceId: criticalRoleId,
    metadata: { code },
  })

  revalidateSuccessionSurfaces()
  return { ok: true, criticalRoleId }
}

export async function updateSuccessionCriticalRole(input: {
  organizationId: string
  userId: string
  criticalRoleId: string
  code: string
  title: string
  businessImpact: string
  leadershipLevel: string
  vacancyRisk: string
  replacementDifficulty: string
  orgUnitId: string | null
  positionId: string | null
  jobFamilyRef: string | null
  gradeRef: string | null
  incumbentEmployeeId: string | null
  notes: string | null
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const existing = await db.query.hrmSuccessionCriticalRole.findFirst({
    where: and(
      eq(hrmSuccessionCriticalRole.organizationId, input.organizationId),
      eq(hrmSuccessionCriticalRole.id, input.criticalRoleId)
    ),
    columns: { id: true },
  })
  if (!existing) {
    return { ok: false, form: "Critical role not found." }
  }

  await db
    .update(hrmSuccessionCriticalRole)
    .set({
      title: input.title.trim(),
      businessImpact: input.businessImpact,
      leadershipLevel: input.leadershipLevel.trim(),
      vacancyRisk: input.vacancyRisk,
      replacementDifficulty: input.replacementDifficulty.trim(),
      orgUnitId: emptyToNull(input.orgUnitId),
      positionId: emptyToNull(input.positionId),
      jobFamilyRef: emptyToNull(input.jobFamilyRef),
      gradeRef: emptyToNull(input.gradeRef),
      incumbentEmployeeId: emptyToNull(input.incumbentEmployeeId),
      notes: emptyToNull(input.notes),
      updatedByUserId: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(hrmSuccessionCriticalRole.id, input.criticalRoleId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.criticalRoleUpdate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_succession_critical_role",
    resourceId: input.criticalRoleId,
    metadata: {},
  })

  revalidateSuccessionSurfaces()
  return { ok: true }
}
