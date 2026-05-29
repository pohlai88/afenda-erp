import "server-only"

import { and, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmFhcFoodHandlerPermit,
  hrmFhcHealthCertificate,
  hrmFhcVerificationReview,
} from "@afenda/platform/db/schema"

import { HRM_FHC_AUDIT } from "../fhc.contract"
import type { HrmFhcRenewalState } from "../schemas/fhc-workflow-state.shared"
import { refreshFhcObligationComplianceStatus } from "./fhc-compliance-context.server"
import { revalidateFhcSurfaces } from "./fhc-revalidate.server"

const RENEWAL_ELIGIBLE_COMPLIANCE = new Set(["expiring", "expired"])

export async function syncFhcPermitRenewalStateForObligation(input: {
  organizationId: string
  obligationId: string
  complianceStatus: string
}): Promise<void> {
  const permit = await db.query.hrmFhcFoodHandlerPermit.findFirst({
    where: and(
      eq(hrmFhcFoodHandlerPermit.organizationId, input.organizationId),
      eq(hrmFhcFoodHandlerPermit.obligationId, input.obligationId)
    ),
    columns: { id: true, renewalState: true },
  })
  if (!permit) return

  const current = permit.renewalState as HrmFhcRenewalState
  if (RENEWAL_ELIGIBLE_COMPLIANCE.has(input.complianceStatus)) {
    if (current === "not_due") {
      await db
        .update(hrmFhcFoodHandlerPermit)
        .set({ renewalState: "pending", updatedAt: new Date() })
        .where(eq(hrmFhcFoodHandlerPermit.id, permit.id))
    }
    return
  }

  if (
    current === "pending" &&
    !RENEWAL_ELIGIBLE_COMPLIANCE.has(input.complianceStatus)
  ) {
    await db
      .update(hrmFhcFoodHandlerPermit)
      .set({ renewalState: "not_due", updatedAt: new Date() })
      .where(eq(hrmFhcFoodHandlerPermit.id, permit.id))
  }
}

export async function submitFhcPermitRenewal(input: {
  organizationId: string
  userId: string
  obligationId: string
  permitNumber: string
  issuingAuthority: string | null
  issueDate: string | null
  expiryDate: string | null
}): Promise<{ ok: true; permitId: string } | { ok: false; form?: string }> {
  const permit = await db.query.hrmFhcFoodHandlerPermit.findFirst({
    where: and(
      eq(hrmFhcFoodHandlerPermit.organizationId, input.organizationId),
      eq(hrmFhcFoodHandlerPermit.obligationId, input.obligationId)
    ),
  })
  if (!permit) {
    return { ok: false, form: "A permit record is required before renewal." }
  }

  const renewalState = permit.renewalState as HrmFhcRenewalState
  if (renewalState !== "pending" && renewalState !== "submitted") {
    return {
      ok: false,
      form: "Renewal is not open for this permit.",
    }
  }

  const permitNumber = input.permitNumber.trim()
  if (!permitNumber) {
    return { ok: false, form: "Permit number is required." }
  }

  await db
    .update(hrmFhcFoodHandlerPermit)
    .set({
      permitNumber,
      issuingAuthority: input.issuingAuthority,
      issueDate: input.issueDate,
      expiryDate: input.expiryDate,
      permitStatus: "pending",
      renewalState: "submitted",
      updatedByUserId: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(hrmFhcFoodHandlerPermit.id, permit.id))

  const existingReview = await db.query.hrmFhcVerificationReview.findFirst({
    where: and(
      eq(hrmFhcVerificationReview.organizationId, input.organizationId),
      eq(hrmFhcVerificationReview.subjectKind, "permit"),
      eq(hrmFhcVerificationReview.subjectId, permit.id),
      eq(hrmFhcVerificationReview.verificationState, "pending_review")
    ),
    columns: { id: true },
  })

  if (!existingReview) {
    await db.insert(hrmFhcVerificationReview).values({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      employeeId: permit.employeeId,
      subjectKind: "permit",
      subjectId: permit.id,
      verificationState: "pending_review",
    })
  }

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.renewalSubmit,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_permit_renewal",
    resourceId: permit.id,
    metadata: {},
  })

  await refreshFhcObligationComplianceStatus({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  revalidateFhcSurfaces()

  return { ok: true, permitId: permit.id }
}

export async function completeFhcPermitRenewalOnVerification(input: {
  organizationId: string
  userId: string
  permitId: string
}): Promise<void> {
  const permit = await db.query.hrmFhcFoodHandlerPermit.findFirst({
    where: and(
      eq(hrmFhcFoodHandlerPermit.organizationId, input.organizationId),
      eq(hrmFhcFoodHandlerPermit.id, input.permitId)
    ),
    columns: { id: true, renewalState: true, obligationId: true },
  })
  if (!permit || permit.renewalState !== "submitted") return

  await db
    .update(hrmFhcFoodHandlerPermit)
    .set({
      renewalState: "verified",
      permitStatus: "active",
      updatedByUserId: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(hrmFhcFoodHandlerPermit.id, permit.id))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.renewalVerify,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_permit_renewal",
    resourceId: permit.id,
    metadata: {},
  })
}

export async function syncFhcHealthRenewalStateForObligation(input: {
  organizationId: string
  obligationId: string
  complianceStatus: string
}): Promise<void> {
  const health = await db.query.hrmFhcHealthCertificate.findFirst({
    where: and(
      eq(hrmFhcHealthCertificate.organizationId, input.organizationId),
      eq(hrmFhcHealthCertificate.obligationId, input.obligationId)
    ),
    columns: { id: true, renewalState: true },
  })
  if (!health) return

  const current = health.renewalState as HrmFhcRenewalState
  if (RENEWAL_ELIGIBLE_COMPLIANCE.has(input.complianceStatus)) {
    if (current === "not_due") {
      await db
        .update(hrmFhcHealthCertificate)
        .set({ renewalState: "pending", updatedAt: new Date() })
        .where(eq(hrmFhcHealthCertificate.id, health.id))
    }
    return
  }

  if (
    current === "pending" &&
    !RENEWAL_ELIGIBLE_COMPLIANCE.has(input.complianceStatus)
  ) {
    await db
      .update(hrmFhcHealthCertificate)
      .set({ renewalState: "not_due", updatedAt: new Date() })
      .where(eq(hrmFhcHealthCertificate.id, health.id))
  }
}

export async function submitFhcHealthRenewal(input: {
  organizationId: string
  userId: string
  obligationId: string
  certificateRef: string | null
  issuedAt: string | null
  expiresAt: string | null
  canPersistHealthCertificateRef: boolean
}): Promise<
  { ok: true; certificateId: string } | { ok: false; form?: string }
> {
  const health = await db.query.hrmFhcHealthCertificate.findFirst({
    where: and(
      eq(hrmFhcHealthCertificate.organizationId, input.organizationId),
      eq(hrmFhcHealthCertificate.obligationId, input.obligationId)
    ),
  })
  if (!health) {
    return {
      ok: false,
      form: "A health certificate record is required before renewal.",
    }
  }

  const renewalState = health.renewalState as HrmFhcRenewalState
  if (renewalState !== "pending" && renewalState !== "submitted") {
    return {
      ok: false,
      form: "Renewal is not open for this health certificate.",
    }
  }

  const certificateRef = input.canPersistHealthCertificateRef
    ? input.certificateRef
    : health.certificateRef

  await db
    .update(hrmFhcHealthCertificate)
    .set({
      certificateRef,
      issuedAt: input.issuedAt,
      expiresAt: input.expiresAt,
      healthStatus: "pending",
      renewalState: "submitted",
      updatedByUserId: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(hrmFhcHealthCertificate.id, health.id))

  const existingReview = await db.query.hrmFhcVerificationReview.findFirst({
    where: and(
      eq(hrmFhcVerificationReview.organizationId, input.organizationId),
      eq(hrmFhcVerificationReview.subjectKind, "health_certificate"),
      eq(hrmFhcVerificationReview.subjectId, health.id),
      eq(hrmFhcVerificationReview.verificationState, "pending_review")
    ),
    columns: { id: true },
  })

  if (!existingReview) {
    await db.insert(hrmFhcVerificationReview).values({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      employeeId: health.employeeId,
      subjectKind: "health_certificate",
      subjectId: health.id,
      verificationState: "pending_review",
    })
  }

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.renewalSubmit,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_health_renewal",
    resourceId: health.id,
    metadata: {},
  })

  await refreshFhcObligationComplianceStatus({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  revalidateFhcSurfaces()

  return { ok: true, certificateId: health.id }
}

export async function completeFhcHealthRenewalOnVerification(input: {
  organizationId: string
  userId: string
  certificateId: string
}): Promise<void> {
  const health = await db.query.hrmFhcHealthCertificate.findFirst({
    where: and(
      eq(hrmFhcHealthCertificate.organizationId, input.organizationId),
      eq(hrmFhcHealthCertificate.id, input.certificateId)
    ),
    columns: { id: true, renewalState: true, obligationId: true },
  })
  if (!health || health.renewalState !== "submitted") return

  await db
    .update(hrmFhcHealthCertificate)
    .set({
      renewalState: "verified",
      healthStatus: "active",
      updatedByUserId: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(hrmFhcHealthCertificate.id, health.id))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.renewalVerify,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_health_renewal",
    resourceId: health.id,
    metadata: {},
  })
}
