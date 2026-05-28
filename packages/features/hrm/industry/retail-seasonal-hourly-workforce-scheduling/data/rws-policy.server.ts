import "server-only"

import { eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmRwsRetailSchedulingPolicy } from "@afenda/platform/db/schema"

import { HRM_RWS_AUDIT } from "../rws.contract"
import { revalidateRwsSurfaces } from "./rws-revalidate.server"
import type { RwsRetailSchedulingPolicyRow } from "./rws.types.shared"

function mapPolicyRow(
  row: typeof hrmRwsRetailSchedulingPolicy.$inferSelect
): RwsRetailSchedulingPolicyRow {
  return {
    id: row.id,
    maxDailyHours: row.maxDailyHours,
    maxWeeklyHours: row.maxWeeklyHours,
    minRestHours: row.minRestHours,
    mealBreakMinutes: row.mealBreakMinutes,
    restBreakMinutes: row.restBreakMinutes,
    minorMaxDailyHours: row.minorMaxDailyHours,
    minorMaxWeeklyHours: row.minorMaxWeeklyHours,
    studentMaxWeeklyHours: row.studentMaxWeeklyHours,
    peakSeasonEnabled: row.peakSeasonEnabled,
    holidayRuleEnabled: row.holidayRuleEnabled,
    weekendRuleEnabled: row.weekendRuleEnabled,
    lateNightRuleEnabled: row.lateNightRuleEnabled,
  }
}

export async function getOrCreateRwsRetailSchedulingPolicy(
  organizationId: string
): Promise<RwsRetailSchedulingPolicyRow> {
  const existing = await db.query.hrmRwsRetailSchedulingPolicy.findFirst({
    where: eq(hrmRwsRetailSchedulingPolicy.organizationId, organizationId),
  })
  if (existing) return mapPolicyRow(existing)

  const id = crypto.randomUUID()
  await db.insert(hrmRwsRetailSchedulingPolicy).values({
    id,
    organizationId,
  })
  const created = await db.query.hrmRwsRetailSchedulingPolicy.findFirst({
    where: eq(hrmRwsRetailSchedulingPolicy.id, id),
  })
  if (!created) {
    throw new Error("Failed to create retail scheduling policy.")
  }
  return mapPolicyRow(created)
}

export async function updateRwsRetailSchedulingPolicy(input: {
  organizationId: string
  userId: string
  patch: Partial<
    Omit<RwsRetailSchedulingPolicyRow, "id"> & {
      peakSeasonEnabled: boolean
      holidayRuleEnabled: boolean
      weekendRuleEnabled: boolean
      lateNightRuleEnabled: boolean
    }
  >
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const policy = await getOrCreateRwsRetailSchedulingPolicy(input.organizationId)

  await db
    .update(hrmRwsRetailSchedulingPolicy)
    .set({
      ...input.patch,
      updatedAt: new Date(),
    })
    .where(eq(hrmRwsRetailSchedulingPolicy.id, policy.id))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_RWS_AUDIT.policyUpdate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_rws_retail_scheduling_policy",
    resourceId: policy.id,
    metadata: {},
  })

  revalidateRwsSurfaces()
  return { ok: true }
}
