import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmLmsCertificate,
  hrmLmsCourse,
  hrmLmsEnrollment,
  hrmLmsProgress,
} from "@afenda/platform/db/schema"

function addDays(base: Date, days: number): Date {
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

export async function issueLmsCertificate(input: {
  organizationId: string
  enrollmentId: string
  certificateRef?: string
}): Promise<
  { ok: true; certificateId: string } | { ok: false; message: string }
> {
  const [ctx] = await db
    .select({
      enrollmentId: hrmLmsEnrollment.id,
      progressStatus: hrmLmsProgress.status,
      validityDays: hrmLmsCourse.validityDays,
      courseCode: hrmLmsCourse.code,
    })
    .from(hrmLmsEnrollment)
    .leftJoin(
      hrmLmsProgress,
      eq(hrmLmsProgress.enrollmentId, hrmLmsEnrollment.id)
    )
    .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .where(
      and(
        eq(hrmLmsEnrollment.organizationId, input.organizationId),
        eq(hrmLmsEnrollment.id, input.enrollmentId),
        eq(hrmLmsEnrollment.approvalState, "approved")
      )
    )
    .limit(1)

  if (!ctx) {
    return { ok: false, message: "Approved enrollment not found." }
  }
  if (ctx.progressStatus !== "completed") {
    return {
      ok: false,
      message: "Progress must be completed before issuing a certificate.",
    }
  }

  const [existing] = await db
    .select({ id: hrmLmsCertificate.id })
    .from(hrmLmsCertificate)
    .where(eq(hrmLmsCertificate.enrollmentId, input.enrollmentId))
    .limit(1)

  if (existing) {
    return {
      ok: false,
      message: "A certificate already exists for this enrollment.",
    }
  }

  const issuedAt = new Date()
  const validityDays = ctx.validityDays ?? 365
  const expiresAt = addDays(issuedAt, validityDays)
  const renewalDueAt = addDays(expiresAt, -30)

  const [cert] = await db
    .insert(hrmLmsCertificate)
    .values({
      organizationId: input.organizationId,
      enrollmentId: input.enrollmentId,
      certificateRef:
        input.certificateRef ??
        `LMS-${ctx.courseCode ?? "COURSE"}-${issuedAt.getUTCFullYear()}`,
      status: "issued",
      issuedAt,
      expiresAt,
      renewalDueAt,
    })
    .returning({ id: hrmLmsCertificate.id })

  const certificateId = cert?.id ?? ""
  if (!certificateId) {
    return { ok: false, message: "Could not issue certificate." }
  }

  return { ok: true, certificateId }
}

export async function renewLmsCertificate(input: {
  organizationId: string
  certificateId: string
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const [cert] = await db
    .select({
      id: hrmLmsCertificate.id,
      enrollmentId: hrmLmsCertificate.enrollmentId,
      expiresAt: hrmLmsCertificate.expiresAt,
      validityDays: hrmLmsCourse.validityDays,
    })
    .from(hrmLmsCertificate)
    .innerJoin(
      hrmLmsEnrollment,
      eq(hrmLmsCertificate.enrollmentId, hrmLmsEnrollment.id)
    )
    .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .where(
      and(
        eq(hrmLmsCertificate.organizationId, input.organizationId),
        eq(hrmLmsCertificate.id, input.certificateId)
      )
    )
    .limit(1)

  if (!cert) {
    return { ok: false, message: "Certificate not found." }
  }

  const renewedAt = new Date()
  const validityDays = cert.validityDays ?? 365
  const expiresAt = addDays(renewedAt, validityDays)
  const renewalDueAt = addDays(expiresAt, -30)

  await db
    .update(hrmLmsCertificate)
    .set({
      status: "renewed",
      issuedAt: renewedAt,
      expiresAt,
      renewalDueAt,
      updatedAt: renewedAt,
    })
    .where(eq(hrmLmsCertificate.id, cert.id))

  await db
    .update(hrmLmsProgress)
    .set({
      status: "renewed",
      updatedAt: renewedAt,
    })
    .where(eq(hrmLmsProgress.enrollmentId, cert.enrollmentId))

  return { ok: true }
}
