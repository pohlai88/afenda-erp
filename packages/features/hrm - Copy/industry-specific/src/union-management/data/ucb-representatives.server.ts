import "server-only"

import { asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmUcbRepresentative, hrmUcbUnion } from "@afenda/platform/db/schema"

import { HRM_UCB_AUDIT } from "../ucb.contract"
import { employeeLabel, emptyToNull } from "./ucb-db-helpers.server"
import { revalidateUcbSurfaces } from "./ucb-revalidate.server"
import type { UcbRepresentativeRow } from "./ucb.types.shared"

export async function listUcbRepresentativesForOrg(
  organizationId: string
): Promise<UcbRepresentativeRow[]> {
  const rows = await db.query.hrmUcbRepresentative.findMany({
    where: eq(hrmUcbRepresentative.organizationId, organizationId),
    orderBy: [asc(hrmUcbRepresentative.roleKind)],
  })

  const result: UcbRepresentativeRow[] = []
  for (const row of rows) {
    const union = await db.query.hrmUcbUnion.findFirst({
      where: eq(hrmUcbUnion.id, row.unionId),
      columns: { code: true, name: true },
    })
    const empLabel = await employeeLabel(organizationId, row.employeeId)
    result.push({
      id: row.id,
      unionId: row.unionId,
      unionLabel: union ? `${union.code} — ${union.name}` : row.unionId,
      employeeLabel: empLabel,
      roleKind: row.roleKind,
      departmentRef: row.departmentRef,
      siteRef: row.siteRef,
      active: row.active,
    })
  }
  return result
}

export async function createUcbRepresentative(input: {
  organizationId: string
  userId: string
  unionId: string
  employeeId: string | null
  roleKind: string
  departmentRef: string | null
  siteRef: string | null
}): Promise<{ ok: true; representativeId: string } | { ok: false; form?: string }> {
  const id = crypto.randomUUID()
  await db.insert(hrmUcbRepresentative).values({
    id,
    organizationId: input.organizationId,
    unionId: input.unionId,
    employeeId: input.employeeId,
    roleKind: input.roleKind,
    departmentRef: emptyToNull(input.departmentRef),
    siteRef: emptyToNull(input.siteRef),
    active: true,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.representativeCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_representative",
    resourceId: id,
    metadata: { roleKind: input.roleKind },
  })

  revalidateUcbSurfaces()
  return { ok: true, representativeId: id }
}
