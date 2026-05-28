import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmRwsStore } from "@afenda/platform/db/schema"

import { HRM_RWS_AUDIT } from "../rws.contract"
import { revalidateRwsSurfaces } from "./rws-revalidate.server"
import type { RwsStoreChoiceRow, RwsStoreRow } from "./rws.types.shared"

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function listRwsStoresForOrg(
  organizationId: string
): Promise<RwsStoreRow[]> {
  const rows = await db.query.hrmRwsStore.findMany({
    where: eq(hrmRwsStore.organizationId, organizationId),
    orderBy: [asc(hrmRwsStore.code)],
  })
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    branchRef: row.branchRef,
    departmentRef: row.departmentRef,
    legalEntityRef: row.legalEntityRef,
    locationRef: row.locationRef,
    active: row.active,
  }))
}

export async function listRwsStoreChoicesForOrg(
  organizationId: string
): Promise<RwsStoreChoiceRow[]> {
  const rows = await listRwsStoresForOrg(organizationId)
  return rows
    .filter((row) => row.active)
    .map((row) => ({
      id: row.id,
      label: `${row.code} — ${row.name}`,
    }))
}

export async function createRwsStore(input: {
  organizationId: string
  userId: string
  code: string
  name: string
  branchRef: string | null
  departmentRef: string | null
  legalEntityRef: string | null
  locationRef: string | null
}): Promise<{ ok: true; storeId: string } | { ok: false; form?: string }> {
  const code = input.code.trim().toUpperCase()
  if (!code) {
    return { ok: false, form: "Store code is required." }
  }

  const existing = await db.query.hrmRwsStore.findFirst({
    where: and(
      eq(hrmRwsStore.organizationId, input.organizationId),
      eq(hrmRwsStore.code, code)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "A store with this code already exists." }
  }

  const storeId = crypto.randomUUID()
  await db.insert(hrmRwsStore).values({
    id: storeId,
    organizationId: input.organizationId,
    code,
    name: input.name.trim(),
    branchRef: emptyToNull(input.branchRef),
    departmentRef: emptyToNull(input.departmentRef),
    legalEntityRef: emptyToNull(input.legalEntityRef),
    locationRef: emptyToNull(input.locationRef),
    active: true,
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_RWS_AUDIT.storeCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_rws_store",
    resourceId: storeId,
    metadata: { code },
  })

  revalidateRwsSurfaces()
  return { ok: true, storeId }
}
