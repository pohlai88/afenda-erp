import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmUcbUnion } from "@afenda/platform/db/schema"

import { HRM_UCB_AUDIT } from "../ucb.contract"
import { revalidateUcbSurfaces } from "./ucb-revalidate.server"
import type { UcbChoiceRow, UcbUnionRow } from "./ucb.types.shared"
import { emptyToNull } from "./ucb-db-helpers.server"

function mapUnionRow(row: typeof hrmUcbUnion.$inferSelect): UcbUnionRow {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    status: row.status as UcbUnionRow["status"],
    representativeRef: row.representativeRef,
    notes: row.notes,
  }
}

export async function listUcbUnionsForOrg(
  organizationId: string
): Promise<UcbUnionRow[]> {
  const rows = await db.query.hrmUcbUnion.findMany({
    where: eq(hrmUcbUnion.organizationId, organizationId),
    orderBy: [asc(hrmUcbUnion.code)],
  })
  return rows.map(mapUnionRow)
}

export async function listUcbUnionChoicesForOrg(
  organizationId: string
): Promise<UcbChoiceRow[]> {
  const rows = await listUcbUnionsForOrg(organizationId)
  return rows
    .filter((row) => row.status === "active")
    .map((row) => ({ id: row.id, label: `${row.code} — ${row.name}` }))
}

export async function createUcbUnion(input: {
  organizationId: string
  userId: string
  code: string
  name: string
  status: string
  representativeRef: string | null
  notes: string | null
}): Promise<{ ok: true; unionId: string } | { ok: false; form?: string }> {
  const code = input.code.trim().toUpperCase()
  if (!code) return { ok: false, form: "Union code is required." }

  const existing = await db.query.hrmUcbUnion.findFirst({
    where: and(
      eq(hrmUcbUnion.organizationId, input.organizationId),
      eq(hrmUcbUnion.code, code)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "A union with this code already exists." }
  }

  const unionId = crypto.randomUUID()
  await db.insert(hrmUcbUnion).values({
    id: unionId,
    organizationId: input.organizationId,
    code,
    name: input.name.trim(),
    status: input.status,
    representativeRef: emptyToNull(input.representativeRef),
    notes: emptyToNull(input.notes),
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.unionCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_union",
    resourceId: unionId,
    metadata: { code },
  })

  revalidateUcbSurfaces()
  return { ok: true, unionId }
}

export async function updateUcbUnion(input: {
  organizationId: string
  userId: string
  unionId: string
  name: string
  status: string
  representativeRef: string | null
  notes: string | null
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const row = await db.query.hrmUcbUnion.findFirst({
    where: and(
      eq(hrmUcbUnion.organizationId, input.organizationId),
      eq(hrmUcbUnion.id, input.unionId)
    ),
    columns: { id: true },
  })
  if (!row) return { ok: false, form: "Union not found." }

  await db
    .update(hrmUcbUnion)
    .set({
      name: input.name.trim(),
      status: input.status,
      representativeRef: emptyToNull(input.representativeRef),
      notes: emptyToNull(input.notes),
      updatedByUserId: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(hrmUcbUnion.id, input.unionId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.unionUpdate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_union",
    resourceId: input.unionId,
    metadata: {},
  })

  revalidateUcbSurfaces()
  return { ok: true }
}
