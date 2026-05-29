import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmUcbLrMeeting } from "@afenda/platform/db/schema"

import { HRM_UCB_AUDIT } from "../ucb.contract"
import { revalidateUcbSurfaces } from "./ucb-revalidate.server"
import type { UcbLrMeetingRow } from "./ucb.types.shared"

function mapMeetingRow(row: typeof hrmUcbLrMeeting.$inferSelect): UcbLrMeetingRow {
  const participants = Array.isArray(row.participantsJson)
    ? (row.participantsJson as unknown[])
    : []
  const actionItems = Array.isArray(row.actionItemsJson)
    ? (row.actionItemsJson as unknown[])
    : []
  return {
    id: row.id,
    title: row.title,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
    status: row.status,
    participantCount: participants.length,
    actionItemCount: actionItems.length,
  }
}

export async function listUcbLrMeetingsForOrg(
  organizationId: string
): Promise<UcbLrMeetingRow[]> {
  const rows = await db.query.hrmUcbLrMeeting.findMany({
    where: eq(hrmUcbLrMeeting.organizationId, organizationId),
    orderBy: [asc(hrmUcbLrMeeting.scheduledAt)],
  })
  return rows.map(mapMeetingRow)
}

export async function createUcbLrMeeting(input: {
  organizationId: string
  userId: string
  title: string
  scheduledAt: string | null
}): Promise<{ ok: true; meetingId: string } | { ok: false; form?: string }> {
  const id = crypto.randomUUID()
  await db.insert(hrmUcbLrMeeting).values({
    id,
    organizationId: input.organizationId,
    title: input.title.trim(),
    scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
    status: "scheduled",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.lrMeetingCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_lr_meeting",
    resourceId: id,
    metadata: { title: input.title },
  })

  revalidateUcbSurfaces()
  return { ok: true, meetingId: id }
}

export async function completeUcbLrMeeting(input: {
  organizationId: string
  userId: string
  meetingId: string
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const row = await db.query.hrmUcbLrMeeting.findFirst({
    where: and(
      eq(hrmUcbLrMeeting.organizationId, input.organizationId),
      eq(hrmUcbLrMeeting.id, input.meetingId)
    ),
    columns: { id: true },
  })
  if (!row) return { ok: false, form: "Meeting not found." }

  await db
    .update(hrmUcbLrMeeting)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(hrmUcbLrMeeting.id, input.meetingId))

  revalidateUcbSurfaces()
  return { ok: true }
}
