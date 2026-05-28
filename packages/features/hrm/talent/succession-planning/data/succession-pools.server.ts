import "server-only"

import { and, asc, count, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmSuccessionPoolMember,
  hrmSuccessionTalentPool,
} from "@afenda/platform/db/schema"

import { HRM_SUCCESSION_AUDIT } from "../succession.contract"
import { revalidateSuccessionSurfaces } from "./succession-revalidate.server"
import type {
  SuccessionPoolMemberRow,
  SuccessionTalentPoolRow,
} from "./succession.types.shared"

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function listSuccessionTalentPoolsForOrg(
  organizationId: string
): Promise<SuccessionTalentPoolRow[]> {
  const rows = await db.query.hrmSuccessionTalentPool.findMany({
    where: eq(hrmSuccessionTalentPool.organizationId, organizationId),
    orderBy: [asc(hrmSuccessionTalentPool.code)],
  })

  const result: SuccessionTalentPoolRow[] = []
  for (const row of rows) {
    const [memberCountRow] = await db
      .select({ count: count() })
      .from(hrmSuccessionPoolMember)
      .where(eq(hrmSuccessionPoolMember.poolId, row.id))
    result.push({
      id: row.id,
      code: row.code,
      name: row.name,
      poolKind: row.poolKind as SuccessionTalentPoolRow["poolKind"],
      description: row.description,
      active: row.active,
      memberCount: Number(memberCountRow?.count ?? 0),
    })
  }
  return result
}

export async function listSuccessionPoolMembersForPool(
  organizationId: string,
  poolId: string
): Promise<SuccessionPoolMemberRow[]> {
  const rows = await db
    .select({
      member: hrmSuccessionPoolMember,
      legalName: hrmEmployee.legalName,
      employeeNumber: hrmEmployee.employeeNumber,
    })
    .from(hrmSuccessionPoolMember)
    .innerJoin(hrmEmployee, eq(hrmEmployee.id, hrmSuccessionPoolMember.employeeId))
    .where(
      and(
        eq(hrmSuccessionPoolMember.organizationId, organizationId),
        eq(hrmSuccessionPoolMember.poolId, poolId)
      )
    )
    .orderBy(asc(hrmEmployee.employeeNumber))

  return rows.map((row) => ({
    id: row.member.id,
    poolId: row.member.poolId,
    employeeId: row.member.employeeId,
    employeeLabel: `${row.employeeNumber} — ${row.legalName}`,
  }))
}

export async function createSuccessionTalentPool(input: {
  organizationId: string
  userId: string
  code: string
  name: string
  poolKind: string
  description: string | null
}): Promise<{ ok: true; poolId: string } | { ok: false; form?: string }> {
  const code = input.code.trim().toUpperCase()
  const existing = await db.query.hrmSuccessionTalentPool.findFirst({
    where: and(
      eq(hrmSuccessionTalentPool.organizationId, input.organizationId),
      eq(hrmSuccessionTalentPool.code, code)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "A talent pool with this code already exists." }
  }

  const poolId = crypto.randomUUID()
  await db.insert(hrmSuccessionTalentPool).values({
    id: poolId,
    organizationId: input.organizationId,
    code,
    name: input.name.trim(),
    poolKind: input.poolKind,
    description: emptyToNull(input.description),
    active: true,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.talentPoolCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_succession_talent_pool",
    resourceId: poolId,
    metadata: { code },
  })

  revalidateSuccessionSurfaces()
  return { ok: true, poolId }
}

export async function addSuccessionPoolMember(input: {
  organizationId: string
  userId: string
  poolId: string
  employeeId: string
}): Promise<{ ok: true; memberId: string } | { ok: false; form?: string }> {
  const pool = await db.query.hrmSuccessionTalentPool.findFirst({
    where: and(
      eq(hrmSuccessionTalentPool.organizationId, input.organizationId),
      eq(hrmSuccessionTalentPool.id, input.poolId)
    ),
    columns: { id: true },
  })
  if (!pool) {
    return { ok: false, form: "Talent pool not found." }
  }

  const existing = await db.query.hrmSuccessionPoolMember.findFirst({
    where: and(
      eq(hrmSuccessionPoolMember.poolId, input.poolId),
      eq(hrmSuccessionPoolMember.employeeId, input.employeeId)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "Employee is already in this pool." }
  }

  const memberId = crypto.randomUUID()
  await db.insert(hrmSuccessionPoolMember).values({
    id: memberId,
    organizationId: input.organizationId,
    poolId: input.poolId,
    employeeId: input.employeeId,
    addedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.poolMemberAdd,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_succession_pool_member",
    resourceId: memberId,
    metadata: { poolId: input.poolId, employeeId: input.employeeId },
  })

  revalidateSuccessionSurfaces()
  return { ok: true, memberId }
}
