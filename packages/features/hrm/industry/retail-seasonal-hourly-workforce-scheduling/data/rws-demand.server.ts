import "server-only"

import { asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmRwsLaborDemandReference, hrmRwsStore } from "@afenda/platform/db/schema"

import { HRM_RWS_AUDIT } from "../rws.contract"
import type { HrmRwsDemandReferenceKind } from "../schemas/rws-workflow-state.shared"
import { revalidateRwsSurfaces } from "./rws-revalidate.server"
import type { RwsLaborDemandReferenceRow } from "./rws.types.shared"

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function listRwsLaborDemandReferencesForOrg(
  organizationId: string
): Promise<RwsLaborDemandReferenceRow[]> {
  const rows = await db
    .select({
      id: hrmRwsLaborDemandReference.id,
      schedulePeriodId: hrmRwsLaborDemandReference.schedulePeriodId,
      storeId: hrmRwsLaborDemandReference.storeId,
      storeCode: hrmRwsStore.code,
      storeName: hrmRwsStore.name,
      referenceKind: hrmRwsLaborDemandReference.referenceKind,
      externalRef: hrmRwsLaborDemandReference.externalRef,
      notes: hrmRwsLaborDemandReference.notes,
      createdAt: hrmRwsLaborDemandReference.createdAt,
    })
    .from(hrmRwsLaborDemandReference)
    .innerJoin(
      hrmRwsStore,
      eq(hrmRwsLaborDemandReference.storeId, hrmRwsStore.id)
    )
    .where(eq(hrmRwsLaborDemandReference.organizationId, organizationId))
    .orderBy(asc(hrmRwsLaborDemandReference.createdAt))

  return rows.map((row) => ({
    id: row.id,
    schedulePeriodId: row.schedulePeriodId,
    storeId: row.storeId,
    storeLabel: `${row.storeCode} — ${row.storeName}`,
    referenceKind: row.referenceKind as HrmRwsDemandReferenceKind,
    externalRef: row.externalRef,
    notes: row.notes,
    createdAt: row.createdAt,
  }))
}

export async function createRwsLaborDemandReference(input: {
  organizationId: string
  userId: string
  schedulePeriodId: string
  storeId: string
  referenceKind: HrmRwsDemandReferenceKind
  externalRef: string | null
  notes: string | null
}): Promise<
  { ok: true; demandReferenceId: string } | { ok: false; form?: string }
> {
  const demandReferenceId = crypto.randomUUID()
  await db.insert(hrmRwsLaborDemandReference).values({
    id: demandReferenceId,
    organizationId: input.organizationId,
    schedulePeriodId: input.schedulePeriodId,
    storeId: input.storeId,
    referenceKind: input.referenceKind,
    externalRef: emptyToNull(input.externalRef),
    notes: emptyToNull(input.notes),
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_RWS_AUDIT.demandReferenceCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_rws_labor_demand_reference",
    resourceId: demandReferenceId,
    metadata: { referenceKind: input.referenceKind },
  })

  revalidateRwsSurfaces()
  return { ok: true, demandReferenceId }
}
