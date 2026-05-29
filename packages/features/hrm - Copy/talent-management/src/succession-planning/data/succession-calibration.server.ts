import "server-only"

import { and, asc, count, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmSuccessionCalibrationEntry,
  hrmSuccessionCalibrationSession,
  hrmSuccessionNomination,
} from "@afenda/platform/db/schema"

import { HRM_SUCCESSION_AUDIT } from "../succession.contract"
import { formatSuccessionDateOnly, parseSuccessionDateOnly } from "./succession-dates.shared"
import { revalidateSuccessionSurfaces } from "./succession-revalidate.server"
import type {
  SuccessionCalibrationEntryRow,
  SuccessionCalibrationSessionRow,
} from "./succession.types.shared"

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function listSuccessionCalibrationSessionsForOrg(
  organizationId: string
): Promise<SuccessionCalibrationSessionRow[]> {
  const rows = await db.query.hrmSuccessionCalibrationSession.findMany({
    where: eq(hrmSuccessionCalibrationSession.organizationId, organizationId),
    orderBy: [asc(hrmSuccessionCalibrationSession.sessionDate)],
  })

  const result: SuccessionCalibrationSessionRow[] = []
  for (const row of rows) {
    const [entryCountRow] = await db
      .select({ count: count() })
      .from(hrmSuccessionCalibrationEntry)
      .where(eq(hrmSuccessionCalibrationEntry.sessionId, row.id))
    result.push({
      id: row.id,
      title: row.title,
      sessionDate: formatSuccessionDateOnly(row.sessionDate),
      status: row.status as SuccessionCalibrationSessionRow["status"],
      notes: row.notes,
      entryCount: Number(entryCountRow?.count ?? 0),
    })
  }
  return result
}

export async function listSuccessionCalibrationEntriesForSession(
  organizationId: string,
  sessionId: string
): Promise<SuccessionCalibrationEntryRow[]> {
  const rows = await db
    .select({
      entry: hrmSuccessionCalibrationEntry,
      legalName: hrmEmployee.legalName,
      employeeNumber: hrmEmployee.employeeNumber,
    })
    .from(hrmSuccessionCalibrationEntry)
    .innerJoin(hrmEmployee, eq(hrmEmployee.id, hrmSuccessionCalibrationEntry.employeeId))
    .where(
      and(
        eq(hrmSuccessionCalibrationEntry.organizationId, organizationId),
        eq(hrmSuccessionCalibrationEntry.sessionId, sessionId)
      )
    )
    .orderBy(asc(hrmEmployee.employeeNumber))

  return rows.map((row) => ({
    id: row.entry.id,
    sessionId: row.entry.sessionId,
    nominationId: row.entry.nominationId,
    employeeId: row.entry.employeeId,
    employeeLabel: `${row.employeeNumber} — ${row.legalName}`,
    outcome: row.entry.outcome as SuccessionCalibrationEntryRow["outcome"],
    comments: row.entry.comments,
    decisionRef: row.entry.decisionRef,
    gridCell: row.entry.gridCell,
  }))
}

export async function createSuccessionCalibrationSession(input: {
  organizationId: string
  userId: string
  title: string
  sessionDate: string | null
  notes: string | null
}): Promise<{ ok: true; sessionId: string } | { ok: false; form?: string }> {
  const sessionId = crypto.randomUUID()
  await db.insert(hrmSuccessionCalibrationSession).values({
    id: sessionId,
    organizationId: input.organizationId,
    title: input.title.trim(),
    sessionDate: parseSuccessionDateOnly(input.sessionDate),
    status: "scheduled",
    notes: emptyToNull(input.notes),
    facilitatorUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.calibrationSessionCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_succession_calibration_session",
    resourceId: sessionId,
    metadata: {},
  })

  revalidateSuccessionSurfaces()
  return { ok: true, sessionId }
}

export async function seedSuccessionCalibrationEntriesFromNominations(input: {
  organizationId: string
  sessionId: string
}): Promise<number> {
  const nominations = await db.query.hrmSuccessionNomination.findMany({
    where: and(
      eq(hrmSuccessionNomination.organizationId, input.organizationId),
      eq(hrmSuccessionNomination.status, "active")
    ),
    columns: {
      id: true,
      candidateEmployeeId: true,
    },
    limit: 50,
  })

  let created = 0
  for (const nomination of nominations) {
    const existing = await db.query.hrmSuccessionCalibrationEntry.findFirst({
      where: and(
        eq(hrmSuccessionCalibrationEntry.sessionId, input.sessionId),
        eq(hrmSuccessionCalibrationEntry.employeeId, nomination.candidateEmployeeId)
      ),
      columns: { id: true },
    })
    if (existing) continue

    await db.insert(hrmSuccessionCalibrationEntry).values({
      organizationId: input.organizationId,
      sessionId: input.sessionId,
      nominationId: nomination.id,
      employeeId: nomination.candidateEmployeeId,
      outcome: "pending",
    })
    created += 1
  }
  return created
}

export async function updateSuccessionCalibrationEntry(input: {
  organizationId: string
  userId: string
  entryId: string
  outcome: string
  comments: string | null
  decisionRef: string | null
  gridCell: string | null
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const existing = await db.query.hrmSuccessionCalibrationEntry.findFirst({
    where: and(
      eq(hrmSuccessionCalibrationEntry.organizationId, input.organizationId),
      eq(hrmSuccessionCalibrationEntry.id, input.entryId)
    ),
    columns: { id: true, nominationId: true },
  })
  if (!existing) {
    return { ok: false, form: "Calibration entry not found." }
  }

  await db
    .update(hrmSuccessionCalibrationEntry)
    .set({
      outcome: input.outcome,
      comments: emptyToNull(input.comments),
      decisionRef: emptyToNull(input.decisionRef),
      gridCell: emptyToNull(input.gridCell),
      updatedAt: new Date(),
    })
    .where(eq(hrmSuccessionCalibrationEntry.id, input.entryId))

  if (existing.nominationId && input.gridCell) {
    await db
      .update(hrmSuccessionNomination)
      .set({
        performancePotentialGrid: input.gridCell,
        updatedAt: new Date(),
      })
      .where(eq(hrmSuccessionNomination.id, existing.nominationId))
  }

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.calibrationEntryUpdate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_succession_calibration_entry",
    resourceId: input.entryId,
    metadata: { outcome: input.outcome },
  })

  revalidateSuccessionSurfaces()
  return { ok: true }
}
