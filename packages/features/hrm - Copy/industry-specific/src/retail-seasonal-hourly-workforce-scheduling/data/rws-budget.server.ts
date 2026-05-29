import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmRwsLaborBudgetSnapshot, hrmRwsStore } from "@afenda/platform/db/schema"

import { HRM_RWS_AUDIT } from "../rws.contract"
import { revalidateRwsSurfaces } from "./rws-revalidate.server"
import type { RwsLaborBudgetSnapshotRow } from "./rws.types.shared"

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function listRwsLaborBudgetSnapshotsForOrg(
  organizationId: string
): Promise<RwsLaborBudgetSnapshotRow[]> {
  const rows = await db
    .select({
      id: hrmRwsLaborBudgetSnapshot.id,
      schedulePeriodId: hrmRwsLaborBudgetSnapshot.schedulePeriodId,
      storeId: hrmRwsLaborBudgetSnapshot.storeId,
      storeCode: hrmRwsStore.code,
      storeName: hrmRwsStore.name,
      approvedBudgetAmount: hrmRwsLaborBudgetSnapshot.approvedBudgetAmount,
      currencyCode: hrmRwsLaborBudgetSnapshot.currencyCode,
      notes: hrmRwsLaborBudgetSnapshot.notes,
    })
    .from(hrmRwsLaborBudgetSnapshot)
    .innerJoin(
      hrmRwsStore,
      eq(hrmRwsLaborBudgetSnapshot.storeId, hrmRwsStore.id)
    )
    .where(eq(hrmRwsLaborBudgetSnapshot.organizationId, organizationId))
    .orderBy(asc(hrmRwsLaborBudgetSnapshot.createdAt))

  return rows.map((row) => ({
    id: row.id,
    schedulePeriodId: row.schedulePeriodId,
    storeId: row.storeId,
    storeLabel: `${row.storeCode} — ${row.storeName}`,
    approvedBudgetAmount: row.approvedBudgetAmount,
    currencyCode: row.currencyCode,
    notes: row.notes,
  }))
}

export async function upsertRwsLaborBudgetSnapshot(input: {
  organizationId: string
  userId: string
  schedulePeriodId: string
  storeId: string
  approvedBudgetAmount: string
  currencyCode: string | null
  notes: string | null
}): Promise<{ ok: true; budgetSnapshotId: string } | { ok: false; form?: string }> {
  const existing = await db.query.hrmRwsLaborBudgetSnapshot.findFirst({
    where: and(
      eq(hrmRwsLaborBudgetSnapshot.schedulePeriodId, input.schedulePeriodId),
      eq(hrmRwsLaborBudgetSnapshot.storeId, input.storeId)
    ),
  })

  if (existing) {
    await db
      .update(hrmRwsLaborBudgetSnapshot)
      .set({
        approvedBudgetAmount: input.approvedBudgetAmount.trim(),
        currencyCode: emptyToNull(input.currencyCode),
        notes: emptyToNull(input.notes),
        updatedAt: new Date(),
      })
      .where(eq(hrmRwsLaborBudgetSnapshot.id, existing.id))

    await writeIamAuditEventFromNextHeaders({
      action: HRM_RWS_AUDIT.budgetSnapshotUpdate,
      actorUserId: input.userId,
      organizationId: input.organizationId,
      resourceType: "hrm_rws_labor_budget_snapshot",
      resourceId: existing.id,
      metadata: {},
    })

    revalidateRwsSurfaces()
    return { ok: true, budgetSnapshotId: existing.id }
  }

  const budgetSnapshotId = crypto.randomUUID()
  await db.insert(hrmRwsLaborBudgetSnapshot).values({
    id: budgetSnapshotId,
    organizationId: input.organizationId,
    schedulePeriodId: input.schedulePeriodId,
    storeId: input.storeId,
    approvedBudgetAmount: input.approvedBudgetAmount.trim(),
    currencyCode: emptyToNull(input.currencyCode),
    notes: emptyToNull(input.notes),
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_RWS_AUDIT.budgetSnapshotCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_rws_labor_budget_snapshot",
    resourceId: budgetSnapshotId,
    metadata: {},
  })

  revalidateRwsSurfaces()
  return { ok: true, budgetSnapshotId }
}
