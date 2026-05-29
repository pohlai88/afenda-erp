import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmEngagementSurveyCycle } from "@afenda/platform/db/schema"

export type EngagementSurveyCycleOption = {
  id: string
  cycleKey: string
  label: string
}

export async function listEngagementSurveyCycleOptions(
  organizationId: string
): Promise<readonly EngagementSurveyCycleOption[]> {
  const rows = await db
    .select({
      id: hrmEngagementSurveyCycle.id,
      cycleKey: hrmEngagementSurveyCycle.cycleKey,
      label: hrmEngagementSurveyCycle.label,
    })
    .from(hrmEngagementSurveyCycle)
    .where(eq(hrmEngagementSurveyCycle.organizationId, organizationId))
    .orderBy(asc(hrmEngagementSurveyCycle.cycleKey))

  return rows
}

export async function resolveEngagementSurveyCycleId(input: {
  organizationId: string
  cycleId: string | null
  cycleKey: string | null
  cycleLabel: string | null
}): Promise<string | null> {
  const cycleId = input.cycleId?.trim() ?? ""
  if (cycleId.length > 0) {
    const [existing] = await db
      .select({ id: hrmEngagementSurveyCycle.id })
      .from(hrmEngagementSurveyCycle)
      .where(
        and(
          eq(hrmEngagementSurveyCycle.organizationId, input.organizationId),
          eq(hrmEngagementSurveyCycle.id, cycleId)
        )
      )
      .limit(1)
    return existing?.id ?? null
  }

  const cycleKey = input.cycleKey?.trim() ?? ""
  const cycleLabel = input.cycleLabel?.trim() ?? ""
  if (!cycleKey || !cycleLabel) return null

  const [existing] = await db
    .select({ id: hrmEngagementSurveyCycle.id })
    .from(hrmEngagementSurveyCycle)
    .where(
      and(
        eq(hrmEngagementSurveyCycle.organizationId, input.organizationId),
        eq(hrmEngagementSurveyCycle.cycleKey, cycleKey)
      )
    )
    .limit(1)

  if (existing) return existing.id

  const id = crypto.randomUUID()
  await db.insert(hrmEngagementSurveyCycle).values({
    id,
    organizationId: input.organizationId,
    cycleKey,
    label: cycleLabel,
  })

  return id
}
