import "server-only"

import { and, asc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmFrmFieldAssignment,
  hrmFrmWorksite,
} from "@afenda/platform/db/schema"

import { HRM_FRM_AUDIT } from "../frm.contract"
import type { HrmFrmAssignmentType } from "../schemas/frm-workflow-state.shared"
import {
  formatFrmEmployeeLabel,
  formatFrmWorksiteLabel,
} from "./frm-display.shared"
import {
  notifyFrmEmployeeLifecycle,
  notifyFrmManagerLifecycle,
} from "./frm-notification.server"
import { revalidateFrmSurfaces } from "./frm-revalidate.server"
import type { FrmAssignmentRow } from "./frm.types.shared"

async function loadEmployeeLabelMap(
  organizationId: string,
  employeeIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (employeeIds.length === 0) return map

  const employees = await db.query.hrmEmployee.findMany({
    where: and(
      eq(hrmEmployee.organizationId, organizationId),
      eq(hrmEmployee.employmentStatus, "active")
    ),
    columns: {
      id: true,
      employeeNumber: true,
      legalName: true,
      preferredName: true,
    },
  })

  for (const employee of employees) {
    if (employeeIds.includes(employee.id)) {
      map.set(
        employee.id,
        formatFrmEmployeeLabel({
          employeeNumber: employee.employeeNumber,
          legalName: employee.legalName,
          preferredName: employee.preferredName,
        })
      )
    }
  }
  return map
}

export async function listFrmAssignmentsForOrg(
  organizationId: string
): Promise<FrmAssignmentRow[]> {
  const assignments = await db.query.hrmFrmFieldAssignment.findMany({
    where: eq(hrmFrmFieldAssignment.organizationId, organizationId),
    orderBy: [asc(hrmFrmFieldAssignment.startDate)],
  })
  if (assignments.length === 0) return []

  const worksiteIds = [...new Set(assignments.map((a) => a.worksiteId))]
  const employeeIds = [...new Set(assignments.map((a) => a.employeeId))]

  const worksiteMap = new Map<string, string>()
  if (worksiteIds.length > 0) {
    const allWorksites = await db.query.hrmFrmWorksite.findMany({
      where: and(
        eq(hrmFrmWorksite.organizationId, organizationId),
        inArray(hrmFrmWorksite.id, worksiteIds)
      ),
      columns: { id: true, code: true, name: true },
    })
    for (const site of allWorksites) {
      worksiteMap.set(site.id, formatFrmWorksiteLabel(site))
    }
  }

  const employeeMap = await loadEmployeeLabelMap(organizationId, employeeIds)

  return assignments.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeLabel: employeeMap.get(row.employeeId) ?? row.employeeId,
    worksiteId: row.worksiteId,
    worksiteLabel: worksiteMap.get(row.worksiteId) ?? row.worksiteId,
    assignmentType: row.assignmentType as HrmFrmAssignmentType,
    startDate: row.startDate,
    endDate: row.endDate,
    state: row.state,
    managerEmployeeId: row.managerEmployeeId,
    departmentRef: row.departmentRef,
    legalEntityRef: row.legalEntityRef,
  }))
}

export async function findActiveFrmAssignmentForEmployee(input: {
  organizationId: string
  employeeId: string
  asOfDate: string
}) {
  const rows = await db
    .select()
    .from(hrmFrmFieldAssignment)
    .where(
      and(
        eq(hrmFrmFieldAssignment.organizationId, input.organizationId),
        eq(hrmFrmFieldAssignment.employeeId, input.employeeId),
        eq(hrmFrmFieldAssignment.state, "active"),
        lte(hrmFrmFieldAssignment.startDate, input.asOfDate),
        or(
          isNull(hrmFrmFieldAssignment.endDate),
          gte(hrmFrmFieldAssignment.endDate, input.asOfDate)
        )
      )
    )
    .orderBy(asc(hrmFrmFieldAssignment.startDate))
    .limit(1)

  return rows[0] ?? null
}

export async function createFrmFieldAssignment(input: {
  organizationId: string
  userId: string
  employeeId: string
  worksiteId: string
  assignmentType: HrmFrmAssignmentType
  startDate: string
  endDate: string | null
  managerEmployeeId: string | null
  departmentRef: string | null
  legalEntityRef: string | null
  travelApprovalRef: string | null
}): Promise<{ ok: true; assignmentId: string } | { ok: false; form?: string }> {
  if (input.assignmentType === "travel" && !input.travelApprovalRef?.trim()) {
    return {
      ok: false,
      form: "Travel approval reference is required for travel-based assignments.",
    }
  }

  const worksite = await db.query.hrmFrmWorksite.findFirst({
    where: and(
      eq(hrmFrmWorksite.id, input.worksiteId),
      eq(hrmFrmWorksite.organizationId, input.organizationId),
      eq(hrmFrmWorksite.active, true)
    ),
    columns: { id: true },
  })
  if (!worksite) {
    return { ok: false, form: "Worksite not found or inactive." }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmFrmFieldAssignment).values({
    id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    worksiteId: input.worksiteId,
    assignmentType: input.assignmentType,
    startDate: input.startDate,
    endDate: input.endDate,
    managerEmployeeId: input.managerEmployeeId,
    departmentRef: input.departmentRef?.trim() || null,
    legalEntityRef: input.legalEntityRef?.trim() || null,
    travelApprovalRef: input.travelApprovalRef?.trim() || null,
    state: "active",
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FRM_AUDIT.assignmentCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "field_workforce_assignment",
    resourceId: id,
    metadata: {
      employeeId: input.employeeId,
      worksiteId: input.worksiteId,
    },
  })

  await notifyFrmEmployeeLifecycle({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    resourceId: id,
    event: "assignment_created",
    bodyDetail: `Active from ${input.startDate}.`,
  })

  if (input.managerEmployeeId) {
    await notifyFrmManagerLifecycle({
      organizationId: input.organizationId,
      managerEmployeeId: input.managerEmployeeId,
      resourceId: id,
      event: "assignment_created",
      bodyDetail: "A team member field assignment was created.",
    })
  }

  revalidateFrmSurfaces()
  return { ok: true, assignmentId: id }
}

export async function listFrmActiveAssignmentChoicesForOrg(
  organizationId: string
): Promise<
  ReadonlyArray<{
    readonly id: string
    readonly label: string
    readonly employeeId: string
  }>
> {
  const rows = await listFrmAssignmentsForOrg(organizationId)
  return rows
    .filter((row) => row.state === "active")
    .map((row) => ({
      id: row.id,
      label: `${row.employeeLabel} · ${row.worksiteLabel}`,
      employeeId: row.employeeId,
    }))
}
