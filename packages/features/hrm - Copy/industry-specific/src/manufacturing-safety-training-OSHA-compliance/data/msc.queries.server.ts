import "server-only"

import { and, asc, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmMscCorrectiveAction,
  hrmMscEmployeeObligation,
  hrmMscHazardAssessment,
  hrmMscIncident,
  hrmMscSafetyCertification,
  hrmMscMachine,
  hrmMscRegulatoryReference,
  hrmMscSafetyRequirementRule,
  hrmMscSite,
  hrmMscWorkRestriction,
} from "@afenda/platform/db/schema"

import { loadMscObligationComplianceContexts } from "./msc-compliance-context.server"
import type {
  MscCertificationRow,
  MscCorrectiveActionRow,
  MscEmployeeObligationRow,
  MscHazardAssessmentRow,
  MscIncidentRow,
  MscMachineRow,
  MscRegulatoryReferenceRow,
  MscRequirementRuleRow,
  MscSiteChoiceRow,
  MscSiteMasterRow,
  MscWorkRestrictionRow,
} from "./msc.types.shared"

function formatMscEmployeeLabel(input: {
  legalName: string
  preferredName: string | null
}): string {
  return input.preferredName?.trim() || input.legalName
}

export type {
  MscCertificationRow,
  MscCorrectiveActionRow,
  MscEmployeeObligationRow,
  MscHazardAssessmentRow,
  MscIncidentRow,
  MscMachineRow,
  MscRegulatoryReferenceRow,
  MscRequirementRuleRow,
  MscSiteChoiceRow,
  MscSiteMasterRow,
  MscWorkRestrictionRow,
} from "./msc.types.shared"

export async function listMscSitesForOrg(
  organizationId: string
): Promise<MscSiteChoiceRow[]> {
  const sites = await db.query.hrmMscSite.findMany({
    where: and(
      eq(hrmMscSite.organizationId, organizationId),
      isNull(hrmMscSite.archivedAt)
    ),
    columns: { id: true, code: true, name: true },
    orderBy: [asc(hrmMscSite.code)],
  })
  return sites.map((site) => ({
    id: site.id,
    code: site.code,
    name: site.name,
  }))
}

export async function listMscSiteMasterRowsForOrg(
  organizationId: string
): Promise<MscSiteMasterRow[]> {
  const sites = await db.query.hrmMscSite.findMany({
    where: and(
      eq(hrmMscSite.organizationId, organizationId),
      isNull(hrmMscSite.archivedAt)
    ),
    columns: {
      id: true,
      code: true,
      name: true,
      countryCode: true,
      oshaRecordkeepingEnabled: true,
    },
    orderBy: [asc(hrmMscSite.code)],
  })
  return sites.map((site) => ({
    id: site.id,
    code: site.code,
    name: site.name,
    countryCode: site.countryCode,
    oshaRecordkeepingEnabled: site.oshaRecordkeepingEnabled,
  }))
}

export async function listMscMachinesForOrg(
  organizationId: string
): Promise<MscMachineRow[]> {
  const machines = await db.query.hrmMscMachine.findMany({
    where: and(
      eq(hrmMscMachine.organizationId, organizationId),
      isNull(hrmMscMachine.archivedAt)
    ),
    orderBy: [asc(hrmMscMachine.code)],
  })
  if (machines.length === 0) return []

  const siteIds = [
    ...new Set(machines.map((machine) => machine.siteId).filter(Boolean)),
  ] as string[]
  const siteMap = new Map<string, string>()
  if (siteIds.length > 0) {
    const sites = await db.query.hrmMscSite.findMany({
      where: inArray(hrmMscSite.id, siteIds),
      columns: { id: true, code: true, name: true },
    })
    for (const site of sites) {
      siteMap.set(site.id, `${site.code} · ${site.name}`)
    }
  }

  return machines.map((machine) => ({
    id: machine.id,
    code: machine.code,
    name: machine.name,
    siteId: machine.siteId,
    siteLabel: machine.siteId
      ? (siteMap.get(machine.siteId) ?? machine.siteId)
      : null,
  }))
}

export async function listMscRequirementRulesForOrg(
  organizationId: string
): Promise<MscRequirementRuleRow[]> {
  const rules = await db.query.hrmMscSafetyRequirementRule.findMany({
    where: eq(hrmMscSafetyRequirementRule.organizationId, organizationId),
    orderBy: [asc(hrmMscSafetyRequirementRule.createdAt)],
  })
  if (rules.length === 0) return []

  const siteIds = [
    ...new Set(rules.map((rule) => rule.siteId).filter(Boolean)),
  ] as string[]
  const siteMap = new Map<string, string>()
  if (siteIds.length > 0) {
    const sites = await db.query.hrmMscSite.findMany({
      where: and(
        eq(hrmMscSite.organizationId, organizationId),
        inArray(hrmMscSite.id, siteIds)
      ),
      columns: { id: true, code: true, name: true },
    })
    for (const site of sites) {
      siteMap.set(site.id, `${site.code} · ${site.name}`)
    }
  }

  return rules.map((rule) => ({
    id: rule.id,
    siteId: rule.siteId,
    siteLabel: rule.siteId ? (siteMap.get(rule.siteId) ?? rule.siteId) : null,
    machineId: rule.machineId,
    workAreaId: rule.workAreaId,
    countryCode: rule.countryCode,
    legalEntityRef: rule.legalEntityRef,
    roleRef: rule.roleRef,
    departmentRef: rule.departmentRef,
    riskCategory: rule.riskCategory,
    requiresMachineSafety: rule.requiresMachineSafety,
    requiresPpeTraining: rule.requiresPpeTraining,
    requiresPpeAcknowledgment: rule.requiresPpeAcknowledgment,
    requiresChemicalHandling: rule.requiresChemicalHandling,
    requiresFireSafety: rule.requiresFireSafety,
    requiresErgonomics: rule.requiresErgonomics,
    requiresWorkplaceHazard: rule.requiresWorkplaceHazard,
    requiresSafetyCertification: rule.requiresSafetyCertification,
    active: rule.active,
  }))
}

export async function listMscEmployeeObligationsForOrg(
  organizationId: string
): Promise<MscEmployeeObligationRow[]> {
  const obligations = await db.query.hrmMscEmployeeObligation.findMany({
    where: eq(hrmMscEmployeeObligation.organizationId, organizationId),
    orderBy: [asc(hrmMscEmployeeObligation.updatedAt)],
  })
  if (obligations.length === 0) return []

  const employeeIds = [...new Set(obligations.map((row) => row.employeeId))]
  const employees = await db.query.hrmEmployee.findMany({
    where: inArray(hrmEmployee.id, employeeIds),
    columns: {
      id: true,
      legalName: true,
      preferredName: true,
      employeeNumber: true,
    },
  })
  const employeeMap = new Map(
    employees.map((row) => [
      row.id,
      {
        label: formatMscEmployeeLabel(row),
        number: row.employeeNumber,
      },
    ])
  )

  const siteIds = [
    ...new Set(obligations.map((row) => row.siteId).filter(Boolean)),
  ] as string[]
  const siteMap = new Map<string, string>()
  if (siteIds.length > 0) {
    const sites = await db.query.hrmMscSite.findMany({
      where: inArray(hrmMscSite.id, siteIds),
      columns: { id: true, code: true, name: true },
    })
    for (const site of sites) {
      siteMap.set(site.id, `${site.code} · ${site.name}`)
    }
  }

  const contexts = await loadMscObligationComplianceContexts({
    organizationId,
    obligationIds: obligations.map((row) => row.id),
  })

  const certs = await db.query.hrmMscSafetyCertification.findMany({
    where: and(
      eq(hrmMscSafetyCertification.organizationId, organizationId),
      inArray(
        hrmMscSafetyCertification.obligationId,
        obligations.map((row) => row.id)
      )
    ),
    columns: { id: true, obligationId: true, expiryDate: true },
  })
  const certByObligation = new Map(certs.map((row) => [row.obligationId, row]))

  return obligations.map((row) => {
    const employee = employeeMap.get(row.employeeId)
    const ctx = contexts.get(row.id)
    const cert = certByObligation.get(row.id)
    return {
      id: row.id,
      employeeId: row.employeeId,
      employeeLabel: employee?.label ?? row.employeeId,
      employeeNumber: employee?.number ?? null,
      requirementRuleId: row.requirementRuleId,
      siteId: row.siteId,
      siteLabel: row.siteId ? (siteMap.get(row.siteId) ?? row.siteId) : null,
      complianceStatus: row.complianceStatus,
      computedStatus: ctx?.status ?? row.complianceStatus,
      computedAt: row.computedAt,
      certificationId: cert?.id ?? null,
      certExpiryDate: cert?.expiryDate ?? null,
    }
  })
}

export async function listMscCertificationsForOrg(
  organizationId: string
): Promise<MscCertificationRow[]> {
  const certs = await db.query.hrmMscSafetyCertification.findMany({
    where: eq(hrmMscSafetyCertification.organizationId, organizationId),
    orderBy: [asc(hrmMscSafetyCertification.expiryDate)],
  })
  if (certs.length === 0) return []

  const employeeIds = [...new Set(certs.map((row) => row.employeeId))]
  const employees = await db.query.hrmEmployee.findMany({
    where: inArray(hrmEmployee.id, employeeIds),
    columns: { id: true, legalName: true, preferredName: true },
  })
  const employeeMap = new Map(
    employees.map((row) => [row.id, formatMscEmployeeLabel(row)])
  )

  return certs.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeLabel: employeeMap.get(row.employeeId) ?? row.employeeId,
    certificationType: row.certificationType,
    certStatus: row.certStatus,
    issueDate: row.issueDate,
    expiryDate: row.expiryDate,
    renewalDate: row.renewalDate,
  }))
}

export async function listMscHazardAssessmentsForOrg(
  organizationId: string
): Promise<MscHazardAssessmentRow[]> {
  const rows = await db.query.hrmMscHazardAssessment.findMany({
    where: eq(hrmMscHazardAssessment.organizationId, organizationId),
    orderBy: [asc(hrmMscHazardAssessment.updatedAt)],
  })
  if (rows.length === 0) return []

  const siteIds = [
    ...new Set(rows.map((row) => row.siteId).filter(Boolean)),
  ] as string[]
  const siteMap = new Map<string, string>()
  if (siteIds.length > 0) {
    const sites = await db.query.hrmMscSite.findMany({
      where: inArray(hrmMscSite.id, siteIds),
      columns: { id: true, code: true, name: true },
    })
    for (const site of sites) {
      siteMap.set(site.id, `${site.code} · ${site.name}`)
    }
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    assessmentType: row.assessmentType,
    assessmentStatus: row.assessmentStatus,
    siteLabel: row.siteId ? (siteMap.get(row.siteId) ?? row.siteId) : null,
    expiresAt: row.expiresAt,
  }))
}

export async function listMscIncidentsForOrg(
  organizationId: string
): Promise<MscIncidentRow[]> {
  const rows = await db.query.hrmMscIncident.findMany({
    where: eq(hrmMscIncident.organizationId, organizationId),
    orderBy: [asc(hrmMscIncident.incidentDate)],
  })
  if (rows.length === 0) return []

  const siteIds = [
    ...new Set(rows.map((row) => row.siteId).filter(Boolean)),
  ] as string[]
  const employeeIds = [
    ...new Set(rows.map((row) => row.employeeId).filter(Boolean)),
  ] as string[]

  const [sites, employees] = await Promise.all([
    siteIds.length > 0
      ? db.query.hrmMscSite.findMany({
          where: inArray(hrmMscSite.id, siteIds),
          columns: { id: true, code: true, name: true },
        })
      : Promise.resolve([]),
    employeeIds.length > 0
      ? db.query.hrmEmployee.findMany({
          where: inArray(hrmEmployee.id, employeeIds),
          columns: { id: true, legalName: true, preferredName: true },
        })
      : Promise.resolve([]),
  ])

  const siteMap = new Map(
    sites.map((site) => [site.id, `${site.code} · ${site.name}`])
  )
  const employeeMap = new Map(
    employees.map((row) => [row.id, formatMscEmployeeLabel(row)])
  )

  return rows.map((row) => ({
    id: row.id,
    incidentDate: row.incidentDate,
    incidentType: row.incidentType,
    incidentStatus: row.incidentStatus,
    severity: row.severity,
    siteLabel: row.siteId ? (siteMap.get(row.siteId) ?? row.siteId) : null,
    employeeLabel: row.employeeId
      ? (employeeMap.get(row.employeeId) ?? row.employeeId)
      : null,
  }))
}

export async function listMscCorrectiveActionsForOrg(
  organizationId: string
): Promise<MscCorrectiveActionRow[]> {
  const rows = await db.query.hrmMscCorrectiveAction.findMany({
    where: eq(hrmMscCorrectiveAction.organizationId, organizationId),
    orderBy: [asc(hrmMscCorrectiveAction.dueDate)],
  })
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    sourceKind: row.sourceKind,
    priority: row.priority,
    actionStatus: row.actionStatus,
    dueDate: row.dueDate,
    ownerUserId: row.ownerUserId,
  }))
}

export async function listMscWorkRestrictionsForOrg(
  organizationId: string
): Promise<MscWorkRestrictionRow[]> {
  const rows = await db.query.hrmMscWorkRestriction.findMany({
    where: eq(hrmMscWorkRestriction.organizationId, organizationId),
    orderBy: [asc(hrmMscWorkRestriction.effectiveFrom)],
  })
  if (rows.length === 0) return []

  const employeeIds = [...new Set(rows.map((row) => row.employeeId))]
  const employees = await db.query.hrmEmployee.findMany({
    where: inArray(hrmEmployee.id, employeeIds),
    columns: { id: true, legalName: true, preferredName: true },
  })
  const employeeMap = new Map(
    employees.map((row) => [row.id, formatMscEmployeeLabel(row)])
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

export async function listMscEmployeeObligationsByStatusForOrg(
  organizationId: string,
  statuses: readonly string[]
): Promise<MscEmployeeObligationRow[]> {
  const rows = await listMscEmployeeObligationsForOrg(organizationId)
  const allowed = new Set(statuses)
  return rows.filter((row) => allowed.has(row.computedStatus))
}

export async function listMscRegulatoryReferencesForOrg(
  organizationId: string
): Promise<MscRegulatoryReferenceRow[]> {
  const rows = await db.query.hrmMscRegulatoryReference.findMany({
    where: eq(hrmMscRegulatoryReference.organizationId, organizationId),
    orderBy: [asc(hrmMscRegulatoryReference.framework)],
  })
  if (rows.length === 0) return []

  const siteIds = [
    ...new Set(rows.map((row) => row.siteId).filter(Boolean)),
  ] as string[]
  const siteMap = new Map<string, string>()
  if (siteIds.length > 0) {
    const sites = await db.query.hrmMscSite.findMany({
      where: inArray(hrmMscSite.id, siteIds),
      columns: { id: true, code: true, name: true },
    })
    for (const site of sites) {
      siteMap.set(site.id, `${site.code} · ${site.name}`)
    }
  }

  return rows.map((row) => ({
    id: row.id,
    framework: row.framework,
    referenceCode: row.referenceCode,
    referenceLabel: row.referenceLabel,
    siteLabel: row.siteId ? (siteMap.get(row.siteId) ?? row.siteId) : null,
    notes: row.notes,
  }))
}
