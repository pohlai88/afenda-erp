import "server-only"

import { and, asc, eq, gte, lte } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmRwsPeriodAssignmentLink,
  hrmRwsRetailCoverageSlot,
  hrmShiftAssignment,
} from "@afenda/platform/db/schema"

import { HRM_RWS_AUDIT } from "../rws.contract"
import type { HrmRwsRetailRole } from "../schemas/rws-workflow-state.shared"
import { compareCoverageSlots } from "./rws-coverage-compare.shared"
import { revalidateRwsSurfaces } from "./rws-revalidate.server"
import type { RwsCoverageGapRow, RwsCoverageSlotRow } from "./rws.types.shared"

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function listRwsCoverageSlotsForPeriod(input: {
  organizationId: string
  schedulePeriodId: string
}): Promise<RwsCoverageSlotRow[]> {
  const rows = await db.query.hrmRwsRetailCoverageSlot.findMany({
    where: and(
      eq(hrmRwsRetailCoverageSlot.organizationId, input.organizationId),
      eq(hrmRwsRetailCoverageSlot.schedulePeriodId, input.schedulePeriodId)
    ),
    orderBy: [
      asc(hrmRwsRetailCoverageSlot.slotDate),
      asc(hrmRwsRetailCoverageSlot.hourOfDay),
    ],
  })
  return rows.map((row) => ({
    id: row.id,
    schedulePeriodId: row.schedulePeriodId,
    storeId: row.storeId,
    slotDate: row.slotDate,
    hourOfDay: row.hourOfDay,
    retailRole: row.retailRole as HrmRwsRetailRole,
    requiredHeadcount: row.requiredHeadcount,
    departmentRef: row.departmentRef,
  }))
}

export async function listRwsCoverageGapsForPeriod(input: {
  organizationId: string
  schedulePeriodId: string
  periodStartDate: string
  periodEndDate: string
}): Promise<RwsCoverageGapRow[]> {
  const slots = await listRwsCoverageSlotsForPeriod(input)
  const links = await db.query.hrmRwsPeriodAssignmentLink.findMany({
    where: eq(
      hrmRwsPeriodAssignmentLink.schedulePeriodId,
      input.schedulePeriodId
    ),
  })

  const assignments = await db.query.hrmShiftAssignment.findMany({
    where: and(
      eq(hrmShiftAssignment.organizationId, input.organizationId),
      gte(hrmShiftAssignment.attendanceDate, input.periodStartDate),
      lte(hrmShiftAssignment.attendanceDate, input.periodEndDate)
    ),
  })

  const scheduledByKey = new Map<string, number>()
  for (const slot of slots) {
    scheduledByKey.set(
      `${slot.slotDate}:${slot.hourOfDay}:${slot.retailRole}`,
      0
    )
  }

  for (const assignment of assignments) {
    const hour = new Date(assignment.scheduledStartAt).getUTCHours()
    const link = links.find((l) => l.shiftAssignmentId === assignment.id)
    if (!link) continue
    const key = `${assignment.attendanceDate}:${hour}:${link.retailRole}`
    if (scheduledByKey.has(key)) {
      scheduledByKey.set(key, (scheduledByKey.get(key) ?? 0) + 1)
    }
  }

  return compareCoverageSlots(
    slots.map((slot) => ({
      coverageSlotId: slot.id,
      slotDate: slot.slotDate,
      hourOfDay: slot.hourOfDay,
      retailRole: slot.retailRole,
      requiredHeadcount: slot.requiredHeadcount,
      scheduledHeadcount:
        scheduledByKey.get(
          `${slot.slotDate}:${slot.hourOfDay}:${slot.retailRole}`
        ) ?? 0,
    }))
  )
}

export async function createRwsCoverageSlot(input: {
  organizationId: string
  userId: string
  schedulePeriodId: string
  storeId: string
  slotDate: string
  hourOfDay: number
  retailRole: HrmRwsRetailRole
  requiredHeadcount: number
  departmentRef: string | null
}): Promise<{ ok: true; coverageSlotId: string } | { ok: false; form?: string }> {
  const coverageSlotId = crypto.randomUUID()
  await db.insert(hrmRwsRetailCoverageSlot).values({
    id: coverageSlotId,
    organizationId: input.organizationId,
    schedulePeriodId: input.schedulePeriodId,
    storeId: input.storeId,
    slotDate: input.slotDate,
    hourOfDay: input.hourOfDay,
    retailRole: input.retailRole,
    requiredHeadcount: input.requiredHeadcount,
    departmentRef: emptyToNull(input.departmentRef),
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_RWS_AUDIT.coverageSlotCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_rws_retail_coverage_slot",
    resourceId: coverageSlotId,
    metadata: {
      schedulePeriodId: input.schedulePeriodId,
      slotDate: input.slotDate,
    },
  })

  revalidateRwsSurfaces()
  return { ok: true, coverageSlotId }
}
