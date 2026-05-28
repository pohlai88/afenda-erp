import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmRwsSchedulePeriod,
  hrmRwsStore,
  hrmShiftRosterPublication,
} from "@afenda/platform/db/schema"

import { HRM_RWS_AUDIT } from "../rws.contract"
import type { HrmRwsPeriodKind } from "../schemas/rws-workflow-state.shared"
import { validateRwsPeriodPublish } from "./rws-publish-guard.server"
import { revalidateRwsSurfaces } from "./rws-revalidate.server"
import { notifyRwsPeriodPublished } from "./rws-notifications.server"
import type { RwsSchedulePeriodRow } from "./rws.types.shared"

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function listRwsSchedulePeriodsForOrg(
  organizationId: string
): Promise<RwsSchedulePeriodRow[]> {
  const rows = await db
    .select({
      id: hrmRwsSchedulePeriod.id,
      storeId: hrmRwsSchedulePeriod.storeId,
      storeCode: hrmRwsStore.code,
      storeName: hrmRwsStore.name,
      code: hrmRwsSchedulePeriod.code,
      name: hrmRwsSchedulePeriod.name,
      periodKind: hrmRwsSchedulePeriod.periodKind,
      state: hrmRwsSchedulePeriod.state,
      periodStartDate: hrmRwsSchedulePeriod.periodStartDate,
      periodEndDate: hrmRwsSchedulePeriod.periodEndDate,
      campaignLabel: hrmRwsSchedulePeriod.campaignLabel,
      publishedAt: hrmRwsSchedulePeriod.publishedAt,
    })
    .from(hrmRwsSchedulePeriod)
    .innerJoin(hrmRwsStore, eq(hrmRwsSchedulePeriod.storeId, hrmRwsStore.id))
    .where(eq(hrmRwsSchedulePeriod.organizationId, organizationId))
    .orderBy(asc(hrmRwsSchedulePeriod.periodStartDate))

  return rows.map((row) => ({
    id: row.id,
    storeId: row.storeId,
    storeLabel: `${row.storeCode} — ${row.storeName}`,
    code: row.code,
    name: row.name,
    periodKind: row.periodKind as RwsSchedulePeriodRow["periodKind"],
    state: row.state as RwsSchedulePeriodRow["state"],
    periodStartDate: row.periodStartDate,
    periodEndDate: row.periodEndDate,
    campaignLabel: row.campaignLabel,
    publishedAt: row.publishedAt,
  }))
}

export async function createRwsSchedulePeriod(input: {
  organizationId: string
  userId: string
  storeId: string
  code: string
  name: string
  periodKind: HrmRwsPeriodKind
  periodStartDate: string
  periodEndDate: string
  campaignLabel: string | null
  teamRef: string | null
  roleRef: string | null
}): Promise<
  { ok: true; schedulePeriodId: string } | { ok: false; form?: string }
> {
  if (input.periodStartDate > input.periodEndDate) {
    return { ok: false, form: "Period end must be on or after start." }
  }

  const code = input.code.trim().toUpperCase()
  const existing = await db.query.hrmRwsSchedulePeriod.findFirst({
    where: and(
      eq(hrmRwsSchedulePeriod.organizationId, input.organizationId),
      eq(hrmRwsSchedulePeriod.code, code)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "A schedule period with this code already exists." }
  }

  const schedulePeriodId = crypto.randomUUID()
  await db.insert(hrmRwsSchedulePeriod).values({
    id: schedulePeriodId,
    organizationId: input.organizationId,
    storeId: input.storeId,
    code,
    name: input.name.trim(),
    periodKind: input.periodKind,
    state: "draft",
    periodStartDate: input.periodStartDate,
    periodEndDate: input.periodEndDate,
    campaignLabel: emptyToNull(input.campaignLabel),
    teamRef: emptyToNull(input.teamRef),
    roleRef: emptyToNull(input.roleRef),
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_RWS_AUDIT.periodCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_rws_schedule_period",
    resourceId: schedulePeriodId,
    metadata: { code, storeId: input.storeId },
  })

  revalidateRwsSurfaces()
  return { ok: true, schedulePeriodId }
}

export async function publishRetailSchedulePeriod(input: {
  organizationId: string
  userId: string
  schedulePeriodId: string
  note: string | null
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const period = await db.query.hrmRwsSchedulePeriod.findFirst({
    where: and(
      eq(hrmRwsSchedulePeriod.organizationId, input.organizationId),
      eq(hrmRwsSchedulePeriod.id, input.schedulePeriodId)
    ),
  })
  if (!period) {
    return { ok: false, form: "Schedule period not found." }
  }
  if (period.state === "published") {
    return { ok: false, form: "This schedule period is already published." }
  }

  const guard = await validateRwsPeriodPublish({
    organizationId: input.organizationId,
    schedulePeriodId: input.schedulePeriodId,
    periodStartDate: period.periodStartDate,
    periodEndDate: period.periodEndDate,
  })
  if (!guard.ok) {
    return { ok: false, form: guard.form }
  }

  const publishedAt = new Date()
  const publicationId = crypto.randomUUID()

  await db.insert(hrmShiftRosterPublication).values({
    id: publicationId,
    organizationId: input.organizationId,
    periodStart: period.periodStartDate,
    periodEnd: period.periodEndDate,
    publishedAt,
    publishedByUserId: input.userId,
    note: emptyToNull(input.note),
  })

  await db
    .update(hrmRwsSchedulePeriod)
    .set({
      state: "published",
      publishedAt,
      publishedByUserId: input.userId,
      updatedAt: publishedAt,
      updatedByUserId: input.userId,
    })
    .where(eq(hrmRwsSchedulePeriod.id, period.id))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_RWS_AUDIT.periodPublish,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_rws_schedule_period",
    resourceId: period.id,
    metadata: {
      publicationId,
      periodStart: period.periodStartDate,
      periodEnd: period.periodEndDate,
      guardWarnings: guard.warnings,
    },
  })

  await notifyRwsPeriodPublished({
    organizationId: input.organizationId,
    schedulePeriodId: period.id,
    periodCode: period.code,
  })

  revalidateRwsSurfaces()
  return { ok: true }
}
