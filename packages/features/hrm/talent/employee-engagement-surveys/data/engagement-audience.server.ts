import "server-only"

import { and, asc, eq, isNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmDepartment, hrmEmployee } from "@afenda/platform/db/schema"

import { resolveClaimEmployeeLegalEntityCode } from "../../../payroll/server"
import {
  listDepartmentsForOrg,
  listJobGradesForOrg,
} from "../../../employees/server"
import { listActiveEmployeeChoicesForLeave } from "../../../time-attendance/server"
import {
  buildDepartmentSegmentPreview,
  buildEngagementAudienceSnapshot,
  engagementAudienceFilterIncludesAllEmployees,
  type EngagementAudienceFilter,
  type EngagementAudienceSnapshot,
} from "../schemas/engagement-audience.shared"
import type { HrmEngagementAnonymityMode } from "../schemas/engagement-workflow.shared"
import { resolveEffectiveMinSegmentResponses } from "../schemas/engagement-anonymity.shared"
import type { EngagementAudienceFilterOptions } from "../schemas/engagement-config.shared"

type ActiveEmployeeAudienceRow = {
  readonly id: string
  readonly employeeNumber: string
  readonly legalName: string
  readonly currentDepartmentId: string | null
  readonly managerEmployeeId: string | null
  readonly currentJobGradeId: string | null
  readonly employmentType: string | null
  readonly workerCategory: string | null
  readonly employmentStartDate: Date | null
  readonly countryCode: string | null
  readonly workStateCode: string | null
}

export type { EngagementAudienceFilterOptions } from "../schemas/engagement-config.shared"

export async function loadEngagementAudienceFilterOptions(
  organizationId: string
): Promise<EngagementAudienceFilterOptions> {
  const [departments, jobGrades, managers, employees] = await Promise.all([
    listDepartmentsForOrg(organizationId, { includeArchived: false }),
    listJobGradesForOrg(organizationId, { includeArchived: false }),
    listActiveEmployeeChoicesForLeave(organizationId),
    loadActiveEmployeesForAudience(organizationId),
  ])

  const legalEntityCodes = new Set<string>()
  const workLocationCodes = new Set<string>()
  const employmentTypes = new Set<string>()
  const workerCategories = new Set<string>()

  const departmentById = new Map(departments.map((d) => [d.id, d] as const))

  for (const employee of employees) {
    if (employee.employmentType?.trim()) {
      employmentTypes.add(employee.employmentType.trim())
    }
    if (employee.workerCategory?.trim()) {
      workerCategories.add(employee.workerCategory.trim())
    }
    if (employee.workStateCode?.trim()) {
      workLocationCodes.add(employee.workStateCode.trim())
    }
    const dept = employee.currentDepartmentId
      ? departmentById.get(employee.currentDepartmentId)
      : null
    if (dept?.workLocationCode?.trim()) {
      workLocationCodes.add(dept.workLocationCode.trim())
    }
  }

  const representativeByDepartment = new Map<
    string,
    ActiveEmployeeAudienceRow
  >()
  for (const employee of employees) {
    if (
      employee.currentDepartmentId &&
      !representativeByDepartment.has(employee.currentDepartmentId)
    ) {
      representativeByDepartment.set(employee.currentDepartmentId, employee)
    }
  }
  await Promise.all(
    [...representativeByDepartment.entries()].map(async ([, employee]) => {
      const legalEntityCode = await resolveClaimEmployeeLegalEntityCode({
        organizationId,
        employeeId: employee.id,
        currentDepartmentId: employee.currentDepartmentId,
        countryCode: employee.countryCode,
      })
      if (legalEntityCode) legalEntityCodes.add(legalEntityCode)
    })
  )

  return {
    departments: departments.map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
    })),
    jobGrades: jobGrades.map((g) => ({
      id: g.id,
      code: g.code,
      name: g.name,
    })),
    managers,
    legalEntityCodes: [...legalEntityCodes].sort(),
    workLocationCodes: [...workLocationCodes].sort(),
    employmentTypes: [...employmentTypes].sort(),
    workerCategories: [...workerCategories].sort(),
  }
}

async function loadActiveEmployeesForAudience(
  organizationId: string
): Promise<ActiveEmployeeAudienceRow[]> {
  return db
    .select({
      id: hrmEmployee.id,
      employeeNumber: hrmEmployee.employeeNumber,
      legalName: hrmEmployee.legalName,
      currentDepartmentId: hrmEmployee.currentDepartmentId,
      managerEmployeeId: hrmEmployee.managerEmployeeId,
      currentJobGradeId: hrmEmployee.currentJobGradeId,
      employmentType: hrmEmployee.employmentType,
      workerCategory: hrmEmployee.workerCategory,
      employmentStartDate: hrmEmployee.employmentStartDate,
      countryCode: hrmEmployee.countryCode,
      workStateCode: hrmEmployee.workStateCode,
    })
    .from(hrmEmployee)
    .where(
      and(
        eq(hrmEmployee.organizationId, organizationId),
        isNull(hrmEmployee.archivedAt),
        eq(hrmEmployee.employmentStatus, "active")
      )
    )
    .orderBy(asc(hrmEmployee.employeeNumber))
}

function monthsSinceStart(start: Date, asOf: Date): number {
  const years = asOf.getFullYear() - start.getFullYear()
  const months = asOf.getMonth() - start.getMonth()
  return years * 12 + months
}

function matchesStringList(
  value: string | null | undefined,
  allowed: string[] | undefined
): boolean {
  if (!allowed?.length) return true
  if (!value?.trim()) return false
  return allowed.includes(value.trim())
}

function matchesUuidList(
  value: string | null | undefined,
  allowed: string[] | undefined
): boolean {
  if (!allowed?.length) return true
  if (!value) return false
  return allowed.includes(value)
}

async function employeeMatchesAudienceFilter(
  organizationId: string,
  employee: ActiveEmployeeAudienceRow,
  filter: EngagementAudienceFilter,
  departmentWorkLocationById: Map<string, string | null>,
  legalEntityByEmployeeId: Map<string, string | null>
): Promise<boolean> {
  if (!matchesUuidList(employee.currentDepartmentId, filter.departmentIds)) {
    return false
  }
  if (!matchesUuidList(employee.managerEmployeeId, filter.managerEmployeeIds)) {
    return false
  }
  if (!matchesUuidList(employee.currentJobGradeId, filter.jobGradeIds)) {
    return false
  }
  if (!matchesStringList(employee.employmentType, filter.employmentTypes)) {
    return false
  }
  if (!matchesStringList(employee.workerCategory, filter.workerCategories)) {
    return false
  }

  if (filter.workLocationCodes?.length) {
    const deptLocation = employee.currentDepartmentId
      ? (departmentWorkLocationById.get(employee.currentDepartmentId) ?? null)
      : null
    const location =
      deptLocation?.trim() || employee.workStateCode?.trim() || null
    if (!location || !filter.workLocationCodes.includes(location)) {
      return false
    }
  }

  if (filter.legalEntityCodes?.length) {
    const code =
      legalEntityByEmployeeId.get(employee.id) ??
      (await resolveClaimEmployeeLegalEntityCode({
        organizationId,
        employeeId: employee.id,
        currentDepartmentId: employee.currentDepartmentId,
        countryCode: employee.countryCode,
      }))
    if (!code || !filter.legalEntityCodes.includes(code)) {
      return false
    }
  }

  if (filter.minTenureMonths != null && filter.minTenureMonths > 0) {
    if (!employee.employmentStartDate) return false
    const tenureMonths = monthsSinceStart(
      employee.employmentStartDate,
      new Date()
    )
    if (tenureMonths < filter.minTenureMonths) return false
  }

  return true
}

export async function resolveEngagementAudienceEmployeeIds(input: {
  organizationId: string
  filter: EngagementAudienceFilter
}): Promise<string[]> {
  const employees = await loadActiveEmployeesForAudience(input.organizationId)
  if (employees.length === 0) return []

  if (engagementAudienceFilterIncludesAllEmployees(input.filter)) {
    return employees.map((e) => e.id)
  }

  const departments = await db
    .select({
      id: hrmDepartment.id,
      workLocationCode: hrmDepartment.workLocationCode,
    })
    .from(hrmDepartment)
    .where(eq(hrmDepartment.organizationId, input.organizationId))

  const departmentWorkLocationById = new Map(
    departments.map((d) => [d.id, d.workLocationCode] as const)
  )

  const legalEntityByEmployeeId = new Map<string, string | null>()
  if (input.filter.legalEntityCodes?.length) {
    await Promise.all(
      employees.map(async (employee) => {
        const code = await resolveClaimEmployeeLegalEntityCode({
          organizationId: input.organizationId,
          employeeId: employee.id,
          currentDepartmentId: employee.currentDepartmentId,
          countryCode: employee.countryCode,
        })
        legalEntityByEmployeeId.set(employee.id, code)
      })
    )
  }

  const matched: string[] = []
  for (const employee of employees) {
    const ok = await employeeMatchesAudienceFilter(
      input.organizationId,
      employee,
      input.filter,
      departmentWorkLocationById,
      legalEntityByEmployeeId
    )
    if (ok) matched.push(employee.id)
  }
  return matched
}

export async function buildEngagementAudienceSnapshotForSurvey(input: {
  organizationId: string
  filter: EngagementAudienceFilter
  anonymityMode: HrmEngagementAnonymityMode
  minSegmentResponses: number | null
}): Promise<EngagementAudienceSnapshot> {
  const [employeeIds, employees, departments] = await Promise.all([
    resolveEngagementAudienceEmployeeIds({
      organizationId: input.organizationId,
      filter: input.filter,
    }),
    loadActiveEmployeesForAudience(input.organizationId),
    listDepartmentsForOrg(input.organizationId, { includeArchived: false }),
  ])

  const departmentLabels = new Map(
    departments.map((d) => [d.id, `${d.code} — ${d.name}`] as const)
  )

  const segmentPreview = buildDepartmentSegmentPreview({
    employees,
    employeeIds,
    departmentLabels,
    anonymityMode: input.anonymityMode,
    minSegmentResponses:
      resolveEffectiveMinSegmentResponses(
        input.anonymityMode,
        input.minSegmentResponses
      ) ?? 0,
  })

  return buildEngagementAudienceSnapshot({
    filter: input.filter,
    employeeIds,
    segmentPreview,
  })
}
