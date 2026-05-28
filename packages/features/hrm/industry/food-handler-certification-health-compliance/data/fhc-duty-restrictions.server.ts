import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmFhcDutyRestriction,
  hrmFhcEmployeeObligation,
} from "@afenda/platform/db/schema"

import { HRM_FHC_AUDIT } from "../fhc.contract"
import { refreshFhcObligationComplianceStatus } from "./fhc-compliance-context.server"
import { revalidateFhcSurfaces } from "./fhc-revalidate.server"
import type { FhcDutyRestrictionRow } from "./fhc.types.shared"

export async function listFhcDutyRestrictionsForOrg(
  organizationId: string
): Promise<FhcDutyRestrictionRow[]> {
  const rows = await db.query.hrmFhcDutyRestriction.findMany({
    where: eq(hrmFhcDutyRestriction.organizationId, organizationId),
    orderBy: [asc(hrmFhcDutyRestriction.effectiveFrom)],
  })
  if (rows.length === 0) return []

  const employeeIds = [...new Set(rows.map((row) => row.employeeId))]
  const employees = await db
    .select({
      id: hrmEmployee.id,
      legalName: hrmEmployee.legalName,
      preferredName: hrmEmployee.preferredName,
    })
    .from(hrmEmployee)
    .where(eq(hrmEmployee.organizationId, organizationId))

  const employeeMap = new Map(
    employees
      .filter((row) => employeeIds.includes(row.id))
      .map((row) => [row.id, row.preferredName?.trim() || row.legalName])
  )

  return rows.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeLabel: employeeMap.get(row.employeeId) ?? row.employeeId,
    restrictionScope: row.restrictionScope,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    reason: row.reason,
  }))
}

export async function createFhcDutyRestriction(input: {
  organizationId: string
  userId: string
  obligationId: string
  restrictionScope: string
  effectiveFrom: string
  effectiveTo: string | null
  reason: string | null
}): Promise<
  { ok: true; restrictionId: string } | { ok: false; form?: string }
> {
  const obligation = await db.query.hrmFhcEmployeeObligation.findFirst({
    where: and(
      eq(hrmFhcEmployeeObligation.organizationId, input.organizationId),
      eq(hrmFhcEmployeeObligation.id, input.obligationId)
    ),
    columns: { id: true, employeeId: true, organizationId: true },
  })
  if (!obligation) {
    return { ok: false, form: "Obligation was not found." }
  }

  const restrictionId = crypto.randomUUID()
  await db.insert(hrmFhcDutyRestriction).values({
    id: restrictionId,
    organizationId: input.organizationId,
    employeeId: obligation.employeeId,
    obligationId: input.obligationId,
    restrictionScope: input.restrictionScope,
    effectiveFrom: input.effectiveFrom,
    effectiveTo: input.effectiveTo,
    reason: input.reason?.trim() || null,
    createdByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.dutyRestrictionCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_restriction",
    resourceId: restrictionId,
    metadata: { restrictionScope: input.restrictionScope },
  })

  await refreshFhcObligationComplianceStatus({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  revalidateFhcSurfaces()

  return { ok: true, restrictionId }
}
