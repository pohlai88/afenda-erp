import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmUcbBargainingUnit,
  hrmUcbMembership,
  hrmUcbUnion,
} from "@afenda/platform/db/schema"

import { HRM_UCB_AUDIT } from "../ucb.contract"
import { employeeLabel } from "./ucb-db-helpers.server"
import { revalidateUcbSurfaces } from "./ucb-revalidate.server"
import type { UcbMembershipRow } from "./ucb.types.shared"

function formatDate(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null
}

async function unionLabel(organizationId: string, unionId: string): Promise<string> {
  const row = await db.query.hrmUcbUnion.findFirst({
    where: and(
      eq(hrmUcbUnion.organizationId, organizationId),
      eq(hrmUcbUnion.id, unionId)
    ),
    columns: { code: true, name: true },
  })
  return row ? `${row.code} — ${row.name}` : unionId
}

export async function listUcbMembershipsForOrg(
  organizationId: string
): Promise<UcbMembershipRow[]> {
  const rows = await db.query.hrmUcbMembership.findMany({
    where: eq(hrmUcbMembership.organizationId, organizationId),
    orderBy: [asc(hrmUcbMembership.membershipStartDate)],
  })

  const result: UcbMembershipRow[] = []
  for (const row of rows) {
    const [empLabel, uLabel] = await Promise.all([
      employeeLabel(organizationId, row.employeeId),
      unionLabel(organizationId, row.unionId),
    ])
    let buLabel: string | null = null
    if (row.bargainingUnitId) {
      const bu = await db.query.hrmUcbBargainingUnit.findFirst({
        where: and(
          eq(hrmUcbBargainingUnit.organizationId, organizationId),
          eq(hrmUcbBargainingUnit.id, row.bargainingUnitId)
        ),
        columns: { code: true, name: true },
      })
      buLabel = bu ? `${bu.code} — ${bu.name}` : row.bargainingUnitId
    }
    result.push({
      id: row.id,
      employeeId: row.employeeId,
      employeeLabel: empLabel ?? row.employeeId,
      unionId: row.unionId,
      unionLabel: uLabel,
      bargainingUnitId: row.bargainingUnitId,
      bargainingUnitLabel: buLabel,
      status: row.status,
      membershipStartDate: formatDate(row.membershipStartDate),
      membershipEndDate: formatDate(row.membershipEndDate),
    })
  }
  return result
}

export async function createUcbMembership(input: {
  organizationId: string
  userId: string
  employeeId: string
  unionId: string
  bargainingUnitId: string | null
  status: string
  membershipStartDate: string | null
  membershipEndDate: string | null
}): Promise<{ ok: true; membershipId: string } | { ok: false; form?: string }> {
  const id = crypto.randomUUID()
  await db.insert(hrmUcbMembership).values({
    id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    unionId: input.unionId,
    bargainingUnitId: input.bargainingUnitId,
    status: input.status,
    membershipStartDate: input.membershipStartDate
      ? new Date(input.membershipStartDate)
      : null,
    membershipEndDate: input.membershipEndDate
      ? new Date(input.membershipEndDate)
      : null,
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.membershipCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_membership",
    resourceId: id,
    metadata: { employeeId: input.employeeId },
  })

  revalidateUcbSurfaces()
  return { ok: true, membershipId: id }
}

export async function updateUcbMembership(input: {
  organizationId: string
  userId: string
  membershipId: string
  bargainingUnitId: string | null
  status: string
  membershipStartDate: string | null
  membershipEndDate: string | null
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const row = await db.query.hrmUcbMembership.findFirst({
    where: and(
      eq(hrmUcbMembership.organizationId, input.organizationId),
      eq(hrmUcbMembership.id, input.membershipId)
    ),
    columns: { id: true },
  })
  if (!row) return { ok: false, form: "Membership not found." }

  await db
    .update(hrmUcbMembership)
    .set({
      bargainingUnitId: input.bargainingUnitId,
      status: input.status,
      membershipStartDate: input.membershipStartDate
        ? new Date(input.membershipStartDate)
        : null,
      membershipEndDate: input.membershipEndDate
        ? new Date(input.membershipEndDate)
        : null,
      updatedByUserId: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(hrmUcbMembership.id, input.membershipId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.membershipUpdate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_membership",
    resourceId: input.membershipId,
    metadata: {},
  })

  revalidateUcbSurfaces()
  return { ok: true }
}
