import "server-only"

import { and, asc, eq, inArray } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmGpgAdjustmentReference,
  hrmGpgLocalityRule,
} from "@afenda/platform/db/schema"

import { HRM_GPG_AUDIT } from "../gpg.contract"
import type {
  HrmGpgAdjustmentType,
  HrmGpgLocalityType,
} from "../schemas/gpg-workflow-state.shared"
import { revalidateGpgSurfaces } from "./gpg-revalidate.server"
import type {
  GpgAdjustmentReferenceRow,
  GpgLocalityRuleRow,
} from "./gpg.types.shared"

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function formatEmployeeLabel(row: {
  employeeNumber: string | null
  legalName: string
  preferredName: string | null
}) {
  const name = row.preferredName?.trim() || row.legalName
  return row.employeeNumber ? `${row.employeeNumber} — ${name}` : name
}

export async function listGpgLocalityRulesForOrg(
  organizationId: string
): Promise<GpgLocalityRuleRow[]> {
  const rows = await db.query.hrmGpgLocalityRule.findMany({
    where: eq(hrmGpgLocalityRule.organizationId, organizationId),
    orderBy: [asc(hrmGpgLocalityRule.code)],
  })
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    localityType: row.localityType as GpgLocalityRuleRow["localityType"],
    areaRef: row.areaRef,
    regionCode: row.regionCode,
    countryCode: row.countryCode,
    city: row.city,
    dutyStationRef: row.dutyStationRef,
    adjustmentPercent: row.adjustmentPercent,
    state: row.state as GpgLocalityRuleRow["state"],
    effectiveDate: row.effectiveDate,
  }))
}

export async function listGpgAdjustmentReferencesForOrg(
  organizationId: string
): Promise<GpgAdjustmentReferenceRow[]> {
  const refs = await db.query.hrmGpgAdjustmentReference.findMany({
    where: eq(hrmGpgAdjustmentReference.organizationId, organizationId),
    orderBy: [asc(hrmGpgAdjustmentReference.effectiveDate)],
  })
  if (refs.length === 0) return []

  const employeeIds = [...new Set(refs.map((row) => row.employeeId))]
  const localityIds = [
    ...new Set(
      refs
        .map((row) => row.localityRuleId)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  const [employeeRows, localityRules] = await Promise.all([
    db
      .select({
        id: hrmEmployee.id,
        legalName: hrmEmployee.legalName,
        preferredName: hrmEmployee.preferredName,
        employeeNumber: hrmEmployee.employeeNumber,
      })
      .from(hrmEmployee)
      .where(
        and(
          eq(hrmEmployee.organizationId, organizationId),
          inArray(hrmEmployee.id, employeeIds)
        )
      ),
    localityIds.length > 0
      ? db.query.hrmGpgLocalityRule.findMany({
          where: and(
            eq(hrmGpgLocalityRule.organizationId, organizationId),
            inArray(hrmGpgLocalityRule.id, localityIds)
          ),
          columns: { id: true, code: true, name: true },
        })
      : Promise.resolve([]),
  ])

  const employeeMap = new Map(
    employeeRows.map((row) => [row.id, formatEmployeeLabel(row)] as const)
  )

  const localityMap = new Map(
    localityRules.map((row) => [row.id, `${row.code} — ${row.name}`] as const)
  )

  return refs.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeLabel: employeeMap.get(row.employeeId) ?? row.employeeId,
    adjustmentType:
      row.adjustmentType as GpgAdjustmentReferenceRow["adjustmentType"],
    localityRuleId: row.localityRuleId,
    localityRuleLabel: row.localityRuleId
      ? (localityMap.get(row.localityRuleId) ?? row.localityRuleId)
      : null,
    amount: row.amount,
    percent: row.percent,
    effectiveDate: row.effectiveDate,
  }))
}

export async function createGpgLocalityRule(input: {
  organizationId: string
  userId: string
  code: string
  name: string
  localityType: HrmGpgLocalityType
  effectiveDate: string
  adjustmentPercent: string | null
  areaRef: string | null
  regionCode: string | null
  countryCode: string | null
  city: string | null
  dutyStationRef: string | null
}): Promise<
  { ok: true; localityRuleId: string } | { ok: false; form?: string }
> {
  const code = input.code.trim().toUpperCase()
  if (!code) {
    return { ok: false, form: "Locality rule code is required." }
  }

  const existing = await db.query.hrmGpgLocalityRule.findFirst({
    where: and(
      eq(hrmGpgLocalityRule.organizationId, input.organizationId),
      eq(hrmGpgLocalityRule.code, code)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "A locality rule with this code already exists." }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmGpgLocalityRule).values({
    id,
    organizationId: input.organizationId,
    code,
    name: input.name.trim(),
    localityType: input.localityType,
    effectiveDate: input.effectiveDate,
    adjustmentPercent: emptyToNull(input.adjustmentPercent),
    areaRef: emptyToNull(input.areaRef),
    regionCode: emptyToNull(input.regionCode),
    countryCode: emptyToNull(input.countryCode),
    city: emptyToNull(input.city),
    dutyStationRef: emptyToNull(input.dutyStationRef),
    state: "active",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.localityRuleCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_grade_locality",
    resourceId: id,
    metadata: { code },
  })

  revalidateGpgSurfaces()
  return { ok: true, localityRuleId: id }
}

export async function createGpgAdjustmentReference(input: {
  organizationId: string
  userId: string
  employeeId: string
  adjustmentType: HrmGpgAdjustmentType
  effectiveDate: string
  localityRuleId: string | null
  amount: string | null
  percent: string | null
  currencyCode: string | null
}): Promise<
  { ok: true; adjustmentReferenceId: string } | { ok: false; form?: string }
> {
  const employee = await db.query.hrmEmployee.findFirst({
    where: and(
      eq(hrmEmployee.organizationId, input.organizationId),
      eq(hrmEmployee.id, input.employeeId)
    ),
    columns: { id: true },
  })
  if (!employee) {
    return { ok: false, form: "Employee not found." }
  }

  if (input.localityRuleId) {
    const rule = await db.query.hrmGpgLocalityRule.findFirst({
      where: and(
        eq(hrmGpgLocalityRule.organizationId, input.organizationId),
        eq(hrmGpgLocalityRule.id, input.localityRuleId)
      ),
      columns: { id: true },
    })
    if (!rule) {
      return { ok: false, form: "Locality rule not found." }
    }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmGpgAdjustmentReference).values({
    id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    adjustmentType: input.adjustmentType,
    effectiveDate: input.effectiveDate,
    localityRuleId: input.localityRuleId,
    amount: emptyToNull(input.amount),
    percent: emptyToNull(input.percent),
    currencyCode: emptyToNull(input.currencyCode) ?? "USD",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.adjustmentReferenceCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_grade_adjustment",
    resourceId: id,
    metadata: { employeeId: input.employeeId },
  })

  revalidateGpgSurfaces()
  return { ok: true, adjustmentReferenceId: id }
}
