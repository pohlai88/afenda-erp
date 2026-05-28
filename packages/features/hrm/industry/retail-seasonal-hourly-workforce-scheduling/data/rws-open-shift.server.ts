import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { assignOneShift } from "../../../time-attendance/server"
import { listActiveEmployeeChoicesForSft } from "../../../time-attendance/server"
import { listAllShiftTemplatesForOrg } from "../../../time-attendance/server"
import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmRwsOpenShiftOffer,
  hrmRwsPeriodAssignmentLink,
  hrmRwsStore,
} from "@afenda/platform/db/schema"

import { HRM_RWS_AUDIT } from "../rws.contract"
import type {
  HrmRwsClaimMode,
  HrmRwsRetailRole,
} from "../schemas/rws-workflow-state.shared"
import { revalidateRwsSurfaces } from "./rws-revalidate.server"
import { notifyRwsOpenShiftClaimed } from "./rws-notifications.server"
import { validateRwsEmployeeRetailRoleSkills } from "./rws-skill-validation.server"
import type { RwsOpenShiftOfferRow } from "./rws.types.shared"

export async function listRwsOpenShiftClaimChoices(organizationId: string) {
  const [employees, templates] = await Promise.all([
    listActiveEmployeeChoicesForSft(organizationId),
    listAllShiftTemplatesForOrg(organizationId),
  ])
  return {
    employees,
    templates: templates.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
    })),
  }
}

export async function listRwsOpenShiftOffersForOrg(
  organizationId: string
): Promise<RwsOpenShiftOfferRow[]> {
  const rows = await db
    .select({
      id: hrmRwsOpenShiftOffer.id,
      schedulePeriodId: hrmRwsOpenShiftOffer.schedulePeriodId,
      storeId: hrmRwsOpenShiftOffer.storeId,
      storeCode: hrmRwsStore.code,
      storeName: hrmRwsStore.name,
      slotDate: hrmRwsOpenShiftOffer.slotDate,
      retailRole: hrmRwsOpenShiftOffer.retailRole,
      claimMode: hrmRwsOpenShiftOffer.claimMode,
      status: hrmRwsOpenShiftOffer.status,
      claimedByEmployeeId: hrmRwsOpenShiftOffer.claimedByEmployeeId,
      shiftAssignmentId: hrmRwsOpenShiftOffer.shiftAssignmentId,
    })
    .from(hrmRwsOpenShiftOffer)
    .innerJoin(hrmRwsStore, eq(hrmRwsOpenShiftOffer.storeId, hrmRwsStore.id))
    .where(eq(hrmRwsOpenShiftOffer.organizationId, organizationId))
    .orderBy(asc(hrmRwsOpenShiftOffer.slotDate))

  return rows.map((row) => ({
    id: row.id,
    schedulePeriodId: row.schedulePeriodId,
    storeId: row.storeId,
    storeLabel: `${row.storeCode} — ${row.storeName}`,
    slotDate: row.slotDate,
    retailRole: row.retailRole as HrmRwsRetailRole,
    claimMode: row.claimMode as HrmRwsClaimMode,
    status: row.status as RwsOpenShiftOfferRow["status"],
    claimedByEmployeeId: row.claimedByEmployeeId,
    shiftAssignmentId: row.shiftAssignmentId,
  }))
}

export async function createRwsOpenShiftOffer(input: {
  organizationId: string
  userId: string
  schedulePeriodId: string
  storeId: string
  slotDate: string
  retailRole: HrmRwsRetailRole
  claimMode: HrmRwsClaimMode
  coverageSlotId: string | null
}): Promise<{ ok: true; openShiftOfferId: string } | { ok: false; form?: string }> {
  const openShiftOfferId = crypto.randomUUID()
  await db.insert(hrmRwsOpenShiftOffer).values({
    id: openShiftOfferId,
    organizationId: input.organizationId,
    schedulePeriodId: input.schedulePeriodId,
    storeId: input.storeId,
    slotDate: input.slotDate,
    retailRole: input.retailRole,
    claimMode: input.claimMode,
    coverageSlotId: input.coverageSlotId,
    status: "open",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_RWS_AUDIT.openShiftCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_rws_open_shift_offer",
    resourceId: openShiftOfferId,
    metadata: { slotDate: input.slotDate, retailRole: input.retailRole },
  })

  revalidateRwsSurfaces()
  return { ok: true, openShiftOfferId }
}

export async function claimRwsOpenShiftOffer(input: {
  organizationId: string
  userId: string
  openShiftOfferId: string
  employeeId: string
  shiftTemplateId: string
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const offer = await db.query.hrmRwsOpenShiftOffer.findFirst({
    where: and(
      eq(hrmRwsOpenShiftOffer.organizationId, input.organizationId),
      eq(hrmRwsOpenShiftOffer.id, input.openShiftOfferId)
    ),
  })
  if (!offer) {
    return { ok: false, form: "Open shift offer not found." }
  }
  if (offer.status !== "open" && offer.status !== "pending_approval") {
    return { ok: false, form: "This open shift is no longer available." }
  }

  const skillCheck = await validateRwsEmployeeRetailRoleSkills({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    retailRole: offer.retailRole as HrmRwsRetailRole,
  })
  if (!skillCheck.ok) {
    return { ok: false, form: skillCheck.message }
  }

  const assignResult = await assignOneShift({
    organizationId: input.organizationId,
    userId: input.userId,
    employeeId: input.employeeId,
    attendanceDate: offer.slotDate,
    shiftTemplateId: input.shiftTemplateId,
  })
  if (!assignResult.ok) {
    return {
      ok: false,
      form: assignResult.errors.form ?? "Could not assign shift for pickup.",
    }
  }

  await db.insert(hrmRwsPeriodAssignmentLink).values({
    id: crypto.randomUUID(),
    organizationId: input.organizationId,
    schedulePeriodId: offer.schedulePeriodId,
    shiftAssignmentId: assignResult.assignmentId,
    retailRole: offer.retailRole,
  })

  const nextStatus =
    offer.claimMode === "approval_required" ? "pending_approval" : "filled"

  await db
    .update(hrmRwsOpenShiftOffer)
    .set({
      status: nextStatus,
      claimedByEmployeeId: input.employeeId,
      shiftAssignmentId: assignResult.assignmentId,
      updatedAt: new Date(),
    })
    .where(eq(hrmRwsOpenShiftOffer.id, offer.id))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_RWS_AUDIT.openShiftClaim,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_rws_open_shift_offer",
    resourceId: offer.id,
    metadata: {
      employeeId: input.employeeId,
      shiftAssignmentId: assignResult.assignmentId,
    },
  })

  await notifyRwsOpenShiftClaimed({
    organizationId: input.organizationId,
    openShiftOfferId: offer.id,
    employeeId: input.employeeId,
  })

  revalidateRwsSurfaces()
  return { ok: true }
}
