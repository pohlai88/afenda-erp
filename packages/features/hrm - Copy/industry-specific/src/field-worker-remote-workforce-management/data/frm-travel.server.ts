import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmFrmPerDiemRate,
  hrmFrmPerDiemReference,
  hrmFrmSafetyCheckin,
  hrmFrmTravelCompliance,
  hrmFrmTravelStatus,
} from "@afenda/platform/db/schema"

import { HRM_FRM_AUDIT } from "../frm.contract"
import type { HrmFrmTravelClass } from "../schemas/frm-workflow-state.shared"
import { notifyFrmEmployeeLifecycle } from "./frm-notification.server"
import { evaluateFrmPerDiemEligibility } from "./frm-per-diem-eligibility.shared"
import { formatFrmEmployeeLabel } from "./frm-display.shared"
import { revalidateFrmSurfaces } from "./frm-revalidate.server"
import type {
  FrmPerDiemReferenceRow,
  FrmTravelStatusRow,
} from "./frm.types.shared"

const DEFAULT_COMPLIANCE_CHECKS = [
  "travel_approval",
  "destination_restriction",
  "required_documents",
  "insurance_reference",
  "duty_of_care",
] as const

export async function listFrmTravelStatusesForOrg(
  organizationId: string
): Promise<FrmTravelStatusRow[]> {
  const rows = await db.query.hrmFrmTravelStatus.findMany({
    where: eq(hrmFrmTravelStatus.organizationId, organizationId),
    orderBy: [asc(hrmFrmTravelStatus.startDate)],
  })
  if (rows.length === 0) return []

  const employeeIds = [...new Set(rows.map((r) => r.employeeId))]
  const employees = await db.query.hrmEmployee.findMany({
    where: eq(hrmEmployee.organizationId, organizationId),
    columns: {
      id: true,
      employeeNumber: true,
      legalName: true,
      preferredName: true,
    },
  })
  const labelMap = new Map(
    employees
      .filter((e) => employeeIds.includes(e.id))
      .map((e) => [
        e.id,
        formatFrmEmployeeLabel({
          employeeNumber: e.employeeNumber,
          legalName: e.legalName,
          preferredName: e.preferredName,
        }),
      ])
  )

  const complianceRows = await db.query.hrmFrmTravelCompliance.findMany({
    where: eq(hrmFrmTravelCompliance.organizationId, organizationId),
    columns: { travelStatusId: true, nonCompliant: true },
  })
  const nonCompliantTravel = new Set(
    complianceRows.filter((c) => c.nonCompliant).map((c) => c.travelStatusId)
  )

  return rows.map((row) => ({
    id: row.id,
    assignmentId: row.assignmentId,
    employeeId: row.employeeId,
    employeeLabel: labelMap.get(row.employeeId) ?? row.employeeId,
    travelClass: row.travelClass as HrmFrmTravelClass,
    startDate: row.startDate,
    endDate: row.endDate,
    state: row.state,
    destinationCountry: row.destinationCountry,
    destinationCity: row.destinationCity,
    nonCompliant: nonCompliantTravel.has(row.id),
  }))
}

export async function createFrmTravelStatus(input: {
  organizationId: string
  userId: string
  assignmentId: string
  employeeId: string
  travelClass: HrmFrmTravelClass
  startDate: string
  endDate: string | null
  destinationCountry: string | null
  destinationCity: string | null
  travelApprovalRef: string | null
}): Promise<
  { ok: true; travelStatusId: string } | { ok: false; form?: string }
> {
  const id = crypto.randomUUID()
  await db.insert(hrmFrmTravelStatus).values({
    id,
    organizationId: input.organizationId,
    assignmentId: input.assignmentId,
    employeeId: input.employeeId,
    travelClass: input.travelClass,
    startDate: input.startDate,
    endDate: input.endDate,
    destinationCountry: input.destinationCountry?.trim() || null,
    destinationCity: input.destinationCity?.trim() || null,
    travelApprovalRef: input.travelApprovalRef?.trim() || null,
    state: "planned",
  })

  for (const checklistCode of DEFAULT_COMPLIANCE_CHECKS) {
    await db.insert(hrmFrmTravelCompliance).values({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      travelStatusId: id,
      checklistCode,
      required: true,
      satisfied: Boolean(input.travelApprovalRef?.trim()),
      nonCompliant: !input.travelApprovalRef?.trim(),
    })
  }

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FRM_AUDIT.travelStatusCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "field_workforce_travel_status",
    resourceId: id,
    metadata: { travelClass: input.travelClass },
  })

  if (!input.travelApprovalRef?.trim()) {
    await notifyFrmEmployeeLifecycle({
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      resourceId: id,
      event: "travel_non_compliant",
      bodyDetail: "Travel approval reference is missing on this record.",
      severity: "warning",
    })
  }

  revalidateFrmSurfaces()
  return { ok: true, travelStatusId: id }
}

export async function createFrmPerDiemRate(input: {
  organizationId: string
  userId: string
  code: string
  countryCode: string | null
  city: string | null
  travelClass: HrmFrmTravelClass | null
  fullDayAmount: string
  currencyCode: string
}): Promise<{ ok: true; rateId: string } | { ok: false; form?: string }> {
  const code = input.code.trim().toUpperCase()
  const id = crypto.randomUUID()
  await db.insert(hrmFrmPerDiemRate).values({
    id,
    organizationId: input.organizationId,
    code,
    countryCode: input.countryCode?.trim() || null,
    city: input.city?.trim() || null,
    travelClass: input.travelClass,
    fullDayAmount: input.fullDayAmount.trim(),
    currencyCode: input.currencyCode.trim() || "MYR",
    active: true,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FRM_AUDIT.perDiemRateCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "field_workforce_per_diem_rate",
    resourceId: id,
    metadata: { code },
  })

  revalidateFrmSurfaces()
  return { ok: true, rateId: id }
}

export async function approveFrmPerDiemReference(input: {
  organizationId: string
  userId: string
  travelStatusId: string
  eligibilityDate: string
  employeeCategoryRef: string | null
  policyGroupRef: string | null
}): Promise<{ ok: true; referenceId: string } | { ok: false; form?: string }> {
  const travel = await db.query.hrmFrmTravelStatus.findFirst({
    where: and(
      eq(hrmFrmTravelStatus.id, input.travelStatusId),
      eq(hrmFrmTravelStatus.organizationId, input.organizationId)
    ),
  })
  if (!travel) {
    return { ok: false, form: "Travel status not found." }
  }

  const durationDays =
    travel.endDate && travel.startDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(travel.endDate).getTime() -
              new Date(travel.startDate).getTime()) /
              86_400_000
          ) + 1
        )
      : 1

  const eligibility = evaluateFrmPerDiemEligibility({
    travelClass: travel.travelClass as HrmFrmTravelClass,
    destinationCountry: travel.destinationCountry,
    durationDays,
    employeeCategoryRef: input.employeeCategoryRef,
    policyGroupRef: input.policyGroupRef,
  })

  if (!eligibility.eligible) {
    return {
      ok: false,
      form: eligibility.reason ?? "Not eligible for per diem.",
    }
  }

  const rates = await db.query.hrmFrmPerDiemRate.findMany({
    where: and(
      eq(hrmFrmPerDiemRate.organizationId, input.organizationId),
      eq(hrmFrmPerDiemRate.active, true)
    ),
    orderBy: [asc(hrmFrmPerDiemRate.code)],
    limit: 1,
  })
  const rate = rates[0]
  if (!rate) {
    return { ok: false, form: "Configure at least one per diem rate first." }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmFrmPerDiemReference).values({
    id,
    organizationId: input.organizationId,
    travelStatusId: input.travelStatusId,
    employeeId: travel.employeeId,
    rateId: rate.id,
    eligibilityDate: input.eligibilityDate,
    dayPortion: eligibility.dayPortion,
    approvedAmount: rate.fullDayAmount,
    currencyCode: rate.currencyCode,
    state: "approved",
    approvedByUserId: input.userId,
    approvedAt: new Date(),
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FRM_AUDIT.perDiemReferenceApprove,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "field_workforce_per_diem_reference",
    resourceId: id,
    metadata: { travelStatusId: input.travelStatusId },
  })

  await notifyFrmEmployeeLifecycle({
    organizationId: input.organizationId,
    employeeId: travel.employeeId,
    resourceId: id,
    event: "per_diem_approved",
    bodyDetail: `Approved ${rate.fullDayAmount} ${rate.currencyCode} for ${input.eligibilityDate}.`,
  })

  revalidateFrmSurfaces()
  return { ok: true, referenceId: id }
}

export async function listFrmPerDiemReferencesForOrg(
  organizationId: string
): Promise<FrmPerDiemReferenceRow[]> {
  const rows = await db.query.hrmFrmPerDiemReference.findMany({
    where: eq(hrmFrmPerDiemReference.organizationId, organizationId),
    orderBy: [asc(hrmFrmPerDiemReference.eligibilityDate)],
  })
  if (rows.length === 0) return []

  const employeeIds = [...new Set(rows.map((r) => r.employeeId))]
  const employees = await db.query.hrmEmployee.findMany({
    where: eq(hrmEmployee.organizationId, organizationId),
    columns: {
      id: true,
      employeeNumber: true,
      legalName: true,
      preferredName: true,
    },
  })
  const labelMap = new Map(
    employees
      .filter((e) => employeeIds.includes(e.id))
      .map((e) => [
        e.id,
        formatFrmEmployeeLabel({
          employeeNumber: e.employeeNumber,
          legalName: e.legalName,
          preferredName: e.preferredName,
        }),
      ])
  )

  return rows.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeLabel: labelMap.get(row.employeeId) ?? row.employeeId,
    eligibilityDate: row.eligibilityDate,
    dayPortion: row.dayPortion,
    approvedAmount: row.approvedAmount,
    currencyCode: row.currencyCode,
    state: row.state,
  }))
}

export async function createFrmSafetyCheckin(input: {
  organizationId: string
  userId: string
  assignmentId: string
  employeeId: string
  eventType: "arrival" | "site_departure"
  latitude: string | null
  longitude: string | null
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const id = crypto.randomUUID()
  await db.insert(hrmFrmSafetyCheckin).values({
    id,
    organizationId: input.organizationId,
    assignmentId: input.assignmentId,
    employeeId: input.employeeId,
    eventType: input.eventType,
    occurredAt: new Date(),
    latitude: input.latitude?.trim() || null,
    longitude: input.longitude?.trim() || null,
    createdByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FRM_AUDIT.safetyCheckinCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "field_workforce_safety_checkin",
    resourceId: id,
    metadata: { eventType: input.eventType },
  })

  revalidateFrmSurfaces()
  return { ok: true }
}
