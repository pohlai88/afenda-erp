import "server-only"

import { and, asc, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmFhcEmployeeObligation,
  hrmFhcEvidenceLink,
  hrmFhcFoodHandlerPermit,
  hrmFhcHealthCertificate,
  hrmFhcOutlet,
  hrmFhcRequirementRule,
} from "@afenda/platform/db/schema"

import { loadFhcObligationComplianceContexts } from "./fhc-compliance-context.server"
import type {
  FhcEmployeeObligationRow,
  FhcOutletChoiceRow,
  FhcRequirementRuleRow,
} from "./fhc.types.shared"

export type {
  FhcEmployeeObligationRow,
  FhcOutletChoiceRow,
  FhcRequirementRuleRow,
} from "./fhc.types.shared"

export async function listFhcOutletsForOrg(
  organizationId: string
): Promise<FhcOutletChoiceRow[]> {
  const outlets = await db.query.hrmFhcOutlet.findMany({
    where: and(
      eq(hrmFhcOutlet.organizationId, organizationId),
      isNull(hrmFhcOutlet.archivedAt)
    ),
    columns: { id: true, code: true, name: true },
    orderBy: [asc(hrmFhcOutlet.code)],
  })
  return outlets.map((outlet) => ({
    id: outlet.id,
    code: outlet.code,
    name: outlet.name,
  }))
}

export async function listFhcRequirementRulesForOrg(
  organizationId: string
): Promise<FhcRequirementRuleRow[]> {
  const rules = await db.query.hrmFhcRequirementRule.findMany({
    where: eq(hrmFhcRequirementRule.organizationId, organizationId),
    orderBy: [asc(hrmFhcRequirementRule.createdAt)],
  })
  if (rules.length === 0) return []

  const outletIds = [
    ...new Set(rules.map((rule) => rule.outletId).filter(Boolean)),
  ] as string[]

  const outletMap = new Map<string, string>()
  if (outletIds.length > 0) {
    const outlets = await db.query.hrmFhcOutlet.findMany({
      where: and(
        eq(hrmFhcOutlet.organizationId, organizationId),
        inArray(hrmFhcOutlet.id, outletIds)
      ),
      columns: { id: true, code: true, name: true },
    })
    for (const outlet of outlets) {
      outletMap.set(outlet.id, `${outlet.code} · ${outlet.name}`)
    }
  }

  return rules.map((rule) => ({
    id: rule.id,
    outletId: rule.outletId,
    outletLabel: rule.outletId
      ? (outletMap.get(rule.outletId) ?? rule.outletId)
      : null,
    countryCode: rule.countryCode,
    legalEntityRef: rule.legalEntityRef,
    roleRef: rule.roleRef,
    departmentRef: rule.departmentRef,
    employeeCategoryRef: rule.employeeCategoryRef,
    requiresPermit: rule.requiresPermit,
    requiresHygieneTraining: rule.requiresHygieneTraining,
    requiresAllergenTraining: rule.requiresAllergenTraining,
    requiresHealthCertificate: rule.requiresHealthCertificate,
    active: rule.active,
  }))
}

export async function listFhcEmployeeObligationsForOrg(
  organizationId: string
): Promise<FhcEmployeeObligationRow[]> {
  const obligations = await db.query.hrmFhcEmployeeObligation.findMany({
    where: eq(hrmFhcEmployeeObligation.organizationId, organizationId),
    orderBy: [asc(hrmFhcEmployeeObligation.updatedAt)],
  })
  if (obligations.length === 0) return []

  const employeeIds = [...new Set(obligations.map((row) => row.employeeId))]
  const outletIds = [
    ...new Set(obligations.map((row) => row.outletId).filter(Boolean)),
  ] as string[]

  const [employees, outlets] = await Promise.all([
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
    outletIds.length > 0
      ? db.query.hrmFhcOutlet.findMany({
          where: and(
            eq(hrmFhcOutlet.organizationId, organizationId),
            inArray(hrmFhcOutlet.id, outletIds)
          ),
          columns: { id: true, code: true, name: true },
        })
      : Promise.resolve([]),
  ])

  const employeeMap = new Map<
    string,
    { label: string; employeeNumber: string }
  >()
  for (const employee of employees) {
    const label = employee.preferredName?.trim() || employee.legalName
    employeeMap.set(employee.id, {
      label,
      employeeNumber: employee.employeeNumber,
    })
  }

  const outletMap = new Map<string, string>()
  for (const outlet of outlets) {
    outletMap.set(outlet.id, `${outlet.code} · ${outlet.name}`)
  }

  const ruleIds = [...new Set(obligations.map((row) => row.requirementRuleId))]
  const rules =
    ruleIds.length > 0
      ? await db.query.hrmFhcRequirementRule.findMany({
          where: and(
            eq(hrmFhcRequirementRule.organizationId, organizationId),
            inArray(hrmFhcRequirementRule.id, ruleIds)
          ),
          columns: {
            id: true,
            requiresPermit: true,
            requiresHygieneTraining: true,
            requiresAllergenTraining: true,
            requiresHealthCertificate: true,
          },
        })
      : []
  const ruleMap = new Map(rules.map((rule) => [rule.id, rule]))

  const obligationIds = obligations.map((row) => row.id)

  const [contexts, permits, healthCerts, evidenceLinks] = await Promise.all([
    loadFhcObligationComplianceContexts({
      organizationId,
      obligationIds,
    }),
    db.query.hrmFhcFoodHandlerPermit.findMany({
      where: and(
        eq(hrmFhcFoodHandlerPermit.organizationId, organizationId),
        inArray(hrmFhcFoodHandlerPermit.obligationId, obligationIds)
      ),
      columns: { id: true, obligationId: true, renewalState: true },
    }),
    db.query.hrmFhcHealthCertificate.findMany({
      where: and(
        eq(hrmFhcHealthCertificate.organizationId, organizationId),
        inArray(hrmFhcHealthCertificate.obligationId, obligationIds)
      ),
      columns: { id: true, obligationId: true, renewalState: true },
    }),
    db.query.hrmFhcEvidenceLink.findMany({
      where: eq(hrmFhcEvidenceLink.organizationId, organizationId),
      columns: { subjectKind: true, subjectId: true },
    }),
  ])

  const permitByObligation = new Map(
    permits.map((row) => [row.obligationId, row])
  )
  const healthByObligation = new Map(
    healthCerts.map((row) => [row.obligationId, row])
  )
  const evidenceCountBySubject = new Map<string, number>()
  for (const link of evidenceLinks) {
    const key = `${link.subjectKind}:${link.subjectId}`
    evidenceCountBySubject.set(key, (evidenceCountBySubject.get(key) ?? 0) + 1)
  }

  return obligations.map((row) => {
    const employee = employeeMap.get(row.employeeId)
    const ctx = contexts.get(row.id)
    const rule = ruleMap.get(row.requirementRuleId)
    const computedStatus = ctx?.status ?? row.complianceStatus
    const permit = permitByObligation.get(row.id)
    const health = healthByObligation.get(row.id)
    const permitEvidenceCount = permit
      ? (evidenceCountBySubject.get(`permit:${permit.id}`) ?? 0)
      : 0
    const healthEvidenceCount = health
      ? (evidenceCountBySubject.get(`health_certificate:${health.id}`) ?? 0)
      : 0
    return {
      id: row.id,
      employeeId: row.employeeId,
      employeeLabel: employee?.label ?? row.employeeId,
      employeeNumber: employee?.employeeNumber ?? null,
      requirementRuleId: row.requirementRuleId,
      outletId: row.outletId,
      outletLabel: row.outletId
        ? (outletMap.get(row.outletId) ?? row.outletId)
        : null,
      requiresPermit: rule?.requiresPermit ?? true,
      requiresHygieneTraining: rule?.requiresHygieneTraining ?? false,
      requiresAllergenTraining: rule?.requiresAllergenTraining ?? false,
      requiresHealthCertificate: rule?.requiresHealthCertificate ?? false,
      complianceStatus: row.complianceStatus,
      computedStatus,
      computedAt: row.computedAt,
      permitId: permit?.id ?? null,
      permitRenewalState: permit?.renewalState ?? null,
      healthCertificateId: health?.id ?? null,
      healthRenewalState: health?.renewalState ?? null,
      permitEvidenceCount,
      healthEvidenceCount,
    }
  })
}

export async function listFhcEmployeeObligationsByStatusForOrg(
  organizationId: string,
  statuses: readonly string[]
): Promise<FhcEmployeeObligationRow[]> {
  const rows = await listFhcEmployeeObligationsForOrg(organizationId)
  const allowed = new Set(statuses)
  return rows.filter((row) => allowed.has(row.computedStatus))
}
