import "server-only"

import { and, asc, desc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmUcbCollectiveAgreement,
  hrmUcbGrievance,
  hrmUcbGrievanceStep,
} from "@afenda/platform/db/schema"

import { HRM_UCB_AUDIT } from "../ucb.contract"
import { employeeLabel, emptyToNull } from "./ucb-db-helpers.server"
import { revalidateUcbSurfaces } from "./ucb-revalidate.server"
import type { UcbGrievanceRow } from "./ucb.types.shared"

export async function listUcbGrievancesForOrg(
  organizationId: string
): Promise<UcbGrievanceRow[]> {
  const rows = await db.query.hrmUcbGrievance.findMany({
    where: eq(hrmUcbGrievance.organizationId, organizationId),
    orderBy: [desc(hrmUcbGrievance.createdAt)],
  })

  const result: UcbGrievanceRow[] = []
  for (const row of rows) {
    const [empLabel, agreementTitle] = await Promise.all([
      employeeLabel(organizationId, row.employeeId),
      row.collectiveAgreementId
        ? db.query.hrmUcbCollectiveAgreement
            .findFirst({
              where: eq(hrmUcbCollectiveAgreement.id, row.collectiveAgreementId),
              columns: { title: true },
            })
            .then((a) => a?.title ?? null)
        : Promise.resolve(null),
    ])
    result.push({
      id: row.id,
      employeeId: row.employeeId,
      employeeLabel: empLabel ?? row.employeeId,
      category: row.category,
      clauseCode: row.clauseCode,
      severity: row.severity,
      status: row.status as UcbGrievanceRow["status"],
      summary: row.summary,
      agreementTitle,
      mediationRef: row.mediationRef,
      arbitrationRef: row.arbitrationRef,
      legalMatterRef: row.legalMatterRef,
    })
  }
  return result
}

export async function createUcbGrievance(input: {
  organizationId: string
  userId: string
  employeeId: string
  collectiveAgreementId: string | null
  category: string
  clauseCode: string | null
  severity: string
  summary: string
  departmentRef: string | null
  locationRef: string | null
}): Promise<{ ok: true; grievanceId: string } | { ok: false; form?: string }> {
  const id = crypto.randomUUID()
  await db.insert(hrmUcbGrievance).values({
    id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    collectiveAgreementId: input.collectiveAgreementId,
    category: input.category.trim(),
    clauseCode: emptyToNull(input.clauseCode),
    severity: input.severity,
    status: "submitted",
    summary: input.summary.trim(),
    departmentRef: emptyToNull(input.departmentRef),
    locationRef: emptyToNull(input.locationRef),
    submittedByUserId: input.userId,
  })

  await db.insert(hrmUcbGrievanceStep).values({
    organizationId: input.organizationId,
    grievanceId: id,
    stepLevel: 1,
    notes: "Initial submission",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.grievanceCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_grievance",
    resourceId: id,
    metadata: { category: input.category },
  })

  revalidateUcbSurfaces()
  return { ok: true, grievanceId: id }
}

export async function updateUcbGrievanceStatus(input: {
  organizationId: string
  userId: string
  grievanceId: string
  status: string
  mediationRef: string | null
  arbitrationRef: string | null
  legalMatterRef: string | null
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const row = await db.query.hrmUcbGrievance.findFirst({
    where: and(
      eq(hrmUcbGrievance.organizationId, input.organizationId),
      eq(hrmUcbGrievance.id, input.grievanceId)
    ),
    columns: { id: true },
  })
  if (!row) return { ok: false, form: "Grievance not found." }

  await db
    .update(hrmUcbGrievance)
    .set({
      status: input.status,
      mediationRef: emptyToNull(input.mediationRef),
      arbitrationRef: emptyToNull(input.arbitrationRef),
      legalMatterRef: emptyToNull(input.legalMatterRef),
      updatedAt: new Date(),
    })
    .where(eq(hrmUcbGrievance.id, input.grievanceId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.grievanceUpdate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_grievance",
    resourceId: input.grievanceId,
    metadata: { status: input.status },
  })

  revalidateUcbSurfaces()
  return { ok: true }
}

export async function createUcbGrievanceStep(input: {
  organizationId: string
  userId: string
  grievanceId: string
  stepLevel: number
  deadlineAt: string | null
  meetingAt: string | null
  decision: string | null
  escalationLevel: string | null
  notes: string | null
}): Promise<{ ok: true; stepId: string } | { ok: false; form?: string }> {
  const grievance = await db.query.hrmUcbGrievance.findFirst({
    where: and(
      eq(hrmUcbGrievance.organizationId, input.organizationId),
      eq(hrmUcbGrievance.id, input.grievanceId)
    ),
    columns: { id: true },
  })
  if (!grievance) return { ok: false, form: "Grievance not found." }

  const id = crypto.randomUUID()
  await db.insert(hrmUcbGrievanceStep).values({
    id,
    organizationId: input.organizationId,
    grievanceId: input.grievanceId,
    stepLevel: input.stepLevel,
    deadlineAt: input.deadlineAt ? new Date(input.deadlineAt) : null,
    meetingAt: input.meetingAt ? new Date(input.meetingAt) : null,
    decision: emptyToNull(input.decision),
    escalationLevel: emptyToNull(input.escalationLevel),
    notes: emptyToNull(input.notes),
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.grievanceStepCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_grievance_step",
    resourceId: id,
    metadata: { stepLevel: input.stepLevel },
  })

  revalidateUcbSurfaces()
  return { ok: true, stepId: id }
}

export async function listUcbGrievanceStepsForGrievance(
  organizationId: string,
  grievanceId: string
): Promise<
  Array<{
    id: string
    stepLevel: number
    deadlineAt: string | null
    meetingAt: string | null
    decision: string | null
    escalationLevel: string | null
  }>
> {
  const rows = await db.query.hrmUcbGrievanceStep.findMany({
    where: and(
      eq(hrmUcbGrievanceStep.organizationId, organizationId),
      eq(hrmUcbGrievanceStep.grievanceId, grievanceId)
    ),
    orderBy: [asc(hrmUcbGrievanceStep.stepLevel)],
  })
  return rows.map((row) => ({
    id: row.id,
    stepLevel: row.stepLevel,
    deadlineAt: row.deadlineAt ? row.deadlineAt.toISOString() : null,
    meetingAt: row.meetingAt ? row.meetingAt.toISOString() : null,
    decision: row.decision,
    escalationLevel: row.escalationLevel,
  }))
}
