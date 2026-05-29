import "server-only"

import { and, asc, eq, inArray } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmFhcFoodHandlerPermit,
  hrmFhcHealthCertificate,
  hrmFhcVerificationReview,
} from "@afenda/platform/db/schema"

import { HRM_FHC_AUDIT } from "../fhc.contract"
import { refreshFhcObligationComplianceStatus } from "./fhc-compliance-context.server"
import {
  completeFhcHealthRenewalOnVerification,
  completeFhcPermitRenewalOnVerification,
} from "./fhc-renewal.server"
import { revalidateFhcSurfaces } from "./fhc-revalidate.server"

export type FhcVerificationQueueRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly subjectKind: string
  readonly subjectId: string
  readonly obligationId: string | null
  readonly verificationState: string
  readonly createdAt: Date
}

export async function listFhcVerificationQueueForOrg(
  organizationId: string
): Promise<FhcVerificationQueueRow[]> {
  const reviews = await db.query.hrmFhcVerificationReview.findMany({
    where: and(
      eq(hrmFhcVerificationReview.organizationId, organizationId),
      eq(hrmFhcVerificationReview.verificationState, "pending_review")
    ),
    orderBy: [asc(hrmFhcVerificationReview.createdAt)],
  })
  if (reviews.length === 0) return []

  const employeeIds = [...new Set(reviews.map((row) => row.employeeId))]
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

  const permitSubjectIds = reviews
    .filter((row) => row.subjectKind === "permit")
    .map((row) => row.subjectId)
  const healthSubjectIds = reviews
    .filter((row) => row.subjectKind === "health_certificate")
    .map((row) => row.subjectId)
  const permitObligationById = new Map<string, string>()
  if (permitSubjectIds.length > 0) {
    const permits = await db.query.hrmFhcFoodHandlerPermit.findMany({
      where: and(
        eq(hrmFhcFoodHandlerPermit.organizationId, organizationId),
        inArray(hrmFhcFoodHandlerPermit.id, permitSubjectIds)
      ),
      columns: { id: true, obligationId: true },
    })
    for (const permit of permits) {
      permitObligationById.set(permit.id, permit.obligationId)
    }
  }
  const healthObligationById = new Map<string, string>()
  if (healthSubjectIds.length > 0) {
    const healthCerts = await db.query.hrmFhcHealthCertificate.findMany({
      where: and(
        eq(hrmFhcHealthCertificate.organizationId, organizationId),
        inArray(hrmFhcHealthCertificate.id, healthSubjectIds)
      ),
      columns: { id: true, obligationId: true },
    })
    for (const health of healthCerts) {
      healthObligationById.set(health.id, health.obligationId)
    }
  }

  return reviews.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeLabel: employeeMap.get(row.employeeId) ?? row.employeeId,
    subjectKind: row.subjectKind,
    subjectId: row.subjectId,
    obligationId:
      row.subjectKind === "permit"
        ? (permitObligationById.get(row.subjectId) ?? null)
        : row.subjectKind === "health_certificate"
          ? (healthObligationById.get(row.subjectId) ?? null)
          : null,
    verificationState: row.verificationState,
    createdAt: row.createdAt,
  }))
}

export async function verifyFhcVerificationReview(input: {
  organizationId: string
  userId: string
  reviewId: string
  obligationId: string | null
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const review = await db.query.hrmFhcVerificationReview.findFirst({
    where: eq(hrmFhcVerificationReview.id, input.reviewId),
  })
  if (!review || review.organizationId !== input.organizationId) {
    return { ok: false, form: "Verification review was not found." }
  }

  await db
    .update(hrmFhcVerificationReview)
    .set({
      verificationState: "verified",
      verifiedByUserId: input.userId,
      verifiedAt: new Date(),
      rejectedReason: null,
      updatedAt: new Date(),
    })
    .where(eq(hrmFhcVerificationReview.id, input.reviewId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.verificationApprove,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_verification",
    resourceId: input.reviewId,
    metadata: {},
  })

  if (review.subjectKind === "permit") {
    await completeFhcPermitRenewalOnVerification({
      organizationId: input.organizationId,
      userId: input.userId,
      permitId: review.subjectId,
    })
  } else if (review.subjectKind === "health_certificate") {
    await completeFhcHealthRenewalOnVerification({
      organizationId: input.organizationId,
      userId: input.userId,
      certificateId: review.subjectId,
    })
  }

  if (input.obligationId) {
    await refreshFhcObligationComplianceStatus({
      organizationId: input.organizationId,
      obligationId: input.obligationId,
    })
  }

  revalidateFhcSurfaces()
  return { ok: true }
}

export async function rejectFhcVerificationReview(input: {
  organizationId: string
  userId: string
  reviewId: string
  obligationId: string | null
  rejectedReason: string
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const reason = input.rejectedReason.trim()
  if (!reason) {
    return { ok: false, form: "Rejection reason is required." }
  }

  const review = await db.query.hrmFhcVerificationReview.findFirst({
    where: eq(hrmFhcVerificationReview.id, input.reviewId),
  })
  if (!review || review.organizationId !== input.organizationId) {
    return { ok: false, form: "Verification review was not found." }
  }

  await db
    .update(hrmFhcVerificationReview)
    .set({
      verificationState: "rejected",
      verifiedByUserId: input.userId,
      verifiedAt: new Date(),
      rejectedReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(hrmFhcVerificationReview.id, input.reviewId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.verificationReject,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_verification",
    resourceId: input.reviewId,
    metadata: { rejectedReason: reason },
  })

  if (input.obligationId) {
    await refreshFhcObligationComplianceStatus({
      organizationId: input.organizationId,
      obligationId: input.obligationId,
    })
  }

  revalidateFhcSurfaces()
  return { ok: true }
}
