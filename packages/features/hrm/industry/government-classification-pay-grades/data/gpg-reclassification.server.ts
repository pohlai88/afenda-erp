import "server-only"

import { and, asc, eq, inArray } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmGpgClassification,
  hrmGpgReclassificationRequest,
} from "@afenda/platform/db/schema"

import { HRM_GPG_AUDIT } from "../gpg.contract"
import type { HrmGpgReclassificationState } from "../schemas/gpg-workflow-state.shared"
import { formatGpgClassificationLabel } from "./gpg-display.shared"
import { revalidateGpgSurfaces } from "./gpg-revalidate.server"
import type { GpgReclassificationRequestRow } from "./gpg.types.shared"

function formatEmployeeLabel(row: {
  employeeNumber: string | null
  legalName: string
  preferredName: string | null
}) {
  const name = row.preferredName?.trim() || row.legalName
  return row.employeeNumber ? `${row.employeeNumber} — ${name}` : name
}

export async function listGpgReclassificationRequestsForOrg(
  organizationId: string
): Promise<GpgReclassificationRequestRow[]> {
  const requests = await db.query.hrmGpgReclassificationRequest.findMany({
    where: eq(hrmGpgReclassificationRequest.organizationId, organizationId),
    orderBy: [asc(hrmGpgReclassificationRequest.createdAt)],
  })
  if (requests.length === 0) return []

  const employeeIds = [...new Set(requests.map((row) => row.employeeId))]
  const classificationIds = [
    ...new Set(
      requests.flatMap((row) =>
        [row.fromClassificationId, row.toClassificationId].filter(
          (id): id is string => Boolean(id)
        )
      )
    ),
  ]

  const [employees, classifications] = await Promise.all([
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
    classificationIds.length > 0
      ? db
          .select({
            id: hrmGpgClassification.id,
            code: hrmGpgClassification.code,
            name: hrmGpgClassification.name,
            scheme: hrmGpgClassification.scheme,
            occupationalGroup: hrmGpgClassification.occupationalGroup,
            jobSeries: hrmGpgClassification.jobSeries,
            jobFamily: hrmGpgClassification.jobFamily,
            agencyRef: hrmGpgClassification.agencyRef,
            departmentRef: hrmGpgClassification.departmentRef,
            positionRef: hrmGpgClassification.positionRef,
            state: hrmGpgClassification.state,
            effectiveDate: hrmGpgClassification.effectiveDate,
          })
          .from(hrmGpgClassification)
          .where(
            and(
              eq(hrmGpgClassification.organizationId, organizationId),
              inArray(hrmGpgClassification.id, classificationIds)
            )
          )
      : Promise.resolve([]),
  ])

  const employeeMap = new Map(
    employees.map((row) => [row.id, formatEmployeeLabel(row)] as const)
  )
  const classificationMap = new Map(
    classifications.map(
      (row) => [row.id, formatGpgClassificationLabel(row)] as const
    )
  )

  return requests.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeLabel: employeeMap.get(row.employeeId) ?? row.employeeId,
    fromClassificationLabel: row.fromClassificationId
      ? (classificationMap.get(row.fromClassificationId) ??
        row.fromClassificationId)
      : null,
    toClassificationLabel: row.toClassificationId
      ? (classificationMap.get(row.toClassificationId) ??
        row.toClassificationId)
      : null,
    state: row.state as HrmGpgReclassificationState,
    reason: row.reason,
  }))
}

export async function createGpgReclassificationRequest(input: {
  organizationId: string
  userId: string
  employeeId: string
  fromClassificationId: string | null
  toClassificationId: string
  reason: string | null
}): Promise<{ ok: true; requestId: string } | { ok: false; form?: string }> {
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

  const toClassification = await db.query.hrmGpgClassification.findFirst({
    where: and(
      eq(hrmGpgClassification.organizationId, input.organizationId),
      eq(hrmGpgClassification.id, input.toClassificationId)
    ),
    columns: { id: true },
  })
  if (!toClassification) {
    return { ok: false, form: "Target classification not found." }
  }

  if (input.fromClassificationId) {
    const fromClassification = await db.query.hrmGpgClassification.findFirst({
      where: and(
        eq(hrmGpgClassification.organizationId, input.organizationId),
        eq(hrmGpgClassification.id, input.fromClassificationId)
      ),
      columns: { id: true },
    })
    if (!fromClassification) {
      return { ok: false, form: "From classification not found." }
    }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmGpgReclassificationRequest).values({
    id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    fromClassificationId: input.fromClassificationId,
    toClassificationId: input.toClassificationId,
    state: "submitted",
    reason: input.reason?.trim() || null,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.reclassificationRequestCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_grade_reclassification",
    resourceId: id,
    metadata: { employeeId: input.employeeId },
  })

  revalidateGpgSurfaces()
  return { ok: true, requestId: id }
}

export async function decideGpgReclassificationRequest(input: {
  organizationId: string
  userId: string
  requestId: string
  decision: "approved" | "rejected"
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const request = await db.query.hrmGpgReclassificationRequest.findFirst({
    where: and(
      eq(hrmGpgReclassificationRequest.organizationId, input.organizationId),
      eq(hrmGpgReclassificationRequest.id, input.requestId)
    ),
  })
  if (!request) {
    return { ok: false, form: "Reclassification request not found." }
  }
  if (request.state !== "submitted") {
    return {
      ok: false,
      form: "Only submitted reclassification requests can be decided.",
    }
  }

  const nextState = input.decision === "approved" ? "approved" : "rejected"
  await db
    .update(hrmGpgReclassificationRequest)
    .set({ state: nextState })
    .where(eq(hrmGpgReclassificationRequest.id, input.requestId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.reclassificationRequestDecide,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_grade_reclassification",
    resourceId: input.requestId,
    metadata: {
      employeeId: request.employeeId,
      decision: input.decision,
    },
  })

  revalidateGpgSurfaces()
  return { ok: true }
}
