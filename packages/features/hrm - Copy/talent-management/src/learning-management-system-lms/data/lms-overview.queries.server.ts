import "server-only"

import { and, count, eq, inArray } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmLmsCertificate,
  hrmLmsCourse,
  hrmLmsEnrollment,
  hrmLmsProgress,
} from "@afenda/platform/db/schema"

import { resolveLmsProgressDisplayStatus } from "../lms-progress.shared"
import { listLmsDirectReportEmployeeIds } from "./lms-manager-context.server"

export type LmsOverviewSnapshot = {
  readonly activeCourses: number
  readonly approvedEnrollments: number
  readonly inProgress: number
  readonly completed: number
  readonly overdue: number
  readonly certificatesIssued: number
  readonly pendingApprovals: number
}

async function countApprovedEnrollments(
  organizationId: string,
  employeeIds?: readonly string[]
): Promise<number> {
  const base = and(
    eq(hrmLmsEnrollment.organizationId, organizationId),
    eq(hrmLmsEnrollment.approvalState, "approved")
  )
  const where =
    employeeIds && employeeIds.length > 0
      ? and(base, inArray(hrmLmsEnrollment.employeeId, [...employeeIds]))
      : base

  const [row] = await db
    .select({ value: count() })
    .from(hrmLmsEnrollment)
    .where(where)

  return Number(row?.value ?? 0)
}

async function countPendingApprovals(
  organizationId: string,
  employeeIds?: readonly string[]
): Promise<number> {
  const base = and(
    eq(hrmLmsEnrollment.organizationId, organizationId),
    eq(hrmLmsEnrollment.approvalState, "pending")
  )
  const where =
    employeeIds && employeeIds.length > 0
      ? and(base, inArray(hrmLmsEnrollment.employeeId, [...employeeIds]))
      : base

  const [row] = await db
    .select({ value: count() })
    .from(hrmLmsEnrollment)
    .where(where)

  return Number(row?.value ?? 0)
}

async function countActiveCourses(organizationId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(hrmLmsCourse)
    .where(
      and(
        eq(hrmLmsCourse.organizationId, organizationId),
        eq(hrmLmsCourse.state, "active")
      )
    )

  return Number(row?.value ?? 0)
}

async function countCertificates(
  organizationId: string,
  employeeIds?: readonly string[]
): Promise<number> {
  const base = eq(hrmLmsCertificate.organizationId, organizationId)
  if (!employeeIds || employeeIds.length === 0) {
    const [row] = await db
      .select({ value: count() })
      .from(hrmLmsCertificate)
      .where(base)
    return Number(row?.value ?? 0)
  }

  const [row] = await db
    .select({ value: count() })
    .from(hrmLmsCertificate)
    .innerJoin(
      hrmLmsEnrollment,
      eq(hrmLmsCertificate.enrollmentId, hrmLmsEnrollment.id)
    )
    .where(and(base, inArray(hrmLmsEnrollment.employeeId, [...employeeIds])))

  return Number(row?.value ?? 0)
}

export async function buildLmsOverviewSnapshot(input: {
  organizationId: string
  employeeIds?: readonly string[]
}): Promise<LmsOverviewSnapshot> {
  const progressRows = await db
    .select({
      status: hrmLmsProgress.status,
      percentComplete: hrmLmsProgress.percentComplete,
      enrolledAt: hrmLmsEnrollment.enrolledAt,
      validityDays: hrmLmsCourse.validityDays,
      employeeId: hrmLmsEnrollment.employeeId,
    })
    .from(hrmLmsProgress)
    .innerJoin(
      hrmLmsEnrollment,
      eq(hrmLmsProgress.enrollmentId, hrmLmsEnrollment.id)
    )
    .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .where(
      input.employeeIds && input.employeeIds.length > 0
        ? and(
            eq(hrmLmsProgress.organizationId, input.organizationId),
            eq(hrmLmsEnrollment.approvalState, "approved"),
            inArray(hrmLmsEnrollment.employeeId, [...input.employeeIds])
          )
        : and(
            eq(hrmLmsProgress.organizationId, input.organizationId),
            eq(hrmLmsEnrollment.approvalState, "approved")
          )
    )

  let inProgress = 0
  let completed = 0
  let overdue = 0

  for (const row of progressRows) {
    const displayStatus = resolveLmsProgressDisplayStatus({
      status: row.status,
      percentComplete: row.percentComplete,
      enrolledAt: row.enrolledAt,
      validityDays: row.validityDays,
    })
    if (displayStatus === "completed" || displayStatus === "renewed") {
      completed += 1
    } else if (displayStatus === "overdue") {
      overdue += 1
    } else if (
      displayStatus === "in_progress" ||
      displayStatus === "not_started"
    ) {
      inProgress += 1
    }
  }

  const [
    activeCourses,
    approvedEnrollments,
    certificatesIssued,
    pendingApprovals,
  ] = await Promise.all([
    countActiveCourses(input.organizationId),
    countApprovedEnrollments(input.organizationId, input.employeeIds),
    countCertificates(input.organizationId, input.employeeIds),
    countPendingApprovals(input.organizationId, input.employeeIds),
  ])

  return {
    activeCourses,
    approvedEnrollments,
    inProgress,
    completed,
    overdue,
    certificatesIssued,
    pendingApprovals,
  }
}

export async function buildLmsEmployeeOverviewSnapshot(input: {
  organizationId: string
  employeeId: string
}): Promise<LmsOverviewSnapshot> {
  return buildLmsOverviewSnapshot({
    organizationId: input.organizationId,
    employeeIds: [input.employeeId],
  })
}

export async function buildLmsManagerOverviewSnapshot(input: {
  organizationId: string
  managerEmployeeId: string
}): Promise<LmsOverviewSnapshot> {
  const reportIds = await listLmsDirectReportEmployeeIds({
    organizationId: input.organizationId,
    managerEmployeeId: input.managerEmployeeId,
  })
  return buildLmsOverviewSnapshot({
    organizationId: input.organizationId,
    employeeIds: reportIds,
  })
}
