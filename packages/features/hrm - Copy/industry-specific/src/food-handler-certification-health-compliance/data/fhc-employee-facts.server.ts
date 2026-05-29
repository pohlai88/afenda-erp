import "server-only"

import { and, desc, eq, isNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmEmployeeAssignment,
  hrmPayrollProfile,
} from "@afenda/platform/db/schema"

import type { FhcEmployeeMatchFacts } from "./fhc-rule-match.shared"

function readLegalEntityRefFromPayrollExtras(extras: unknown): string | null {
  if (!extras || typeof extras !== "object") return null
  const raw = (extras as Record<string, unknown>).legalEntityCode
  return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null
}

export async function resolveFhcEmployeeMatchFacts(input: {
  organizationId: string
  employeeId: string
}): Promise<FhcEmployeeMatchFacts> {
  const [assignment, employeeRow, payrollProfile] = await Promise.all([
    db.query.hrmEmployeeAssignment.findFirst({
      where: and(
        eq(hrmEmployeeAssignment.organizationId, input.organizationId),
        eq(hrmEmployeeAssignment.employeeId, input.employeeId),
        eq(hrmEmployeeAssignment.status, "active"),
        isNull(hrmEmployeeAssignment.effectiveTo)
      ),
      columns: {
        departmentId: true,
        positionId: true,
      },
      orderBy: [desc(hrmEmployeeAssignment.effectiveFrom)],
    }),
    db.query.hrmEmployee.findFirst({
      where: and(
        eq(hrmEmployee.organizationId, input.organizationId),
        eq(hrmEmployee.id, input.employeeId)
      ),
      columns: {
        countryCode: true,
        workerCategory: true,
        currentDepartmentId: true,
        currentPositionId: true,
      },
    }),
    db.query.hrmPayrollProfile.findFirst({
      where: and(
        eq(hrmPayrollProfile.organizationId, input.organizationId),
        eq(hrmPayrollProfile.employeeId, input.employeeId),
        isNull(hrmPayrollProfile.effectiveTo)
      ),
      columns: { statutoryProfileExtras: true },
      orderBy: [desc(hrmPayrollProfile.effectiveFrom)],
    }),
  ])

  return {
    countryCode: employeeRow?.countryCode ?? null,
    legalEntityRef: readLegalEntityRefFromPayrollExtras(
      payrollProfile?.statutoryProfileExtras
    ),
    positionId:
      assignment?.positionId ?? employeeRow?.currentPositionId ?? null,
    departmentId:
      assignment?.departmentId ?? employeeRow?.currentDepartmentId ?? null,
    workerCategory: employeeRow?.workerCategory ?? null,
  }
}
