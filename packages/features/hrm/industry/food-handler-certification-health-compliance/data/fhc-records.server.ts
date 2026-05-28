import "server-only"

import { and, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmFhcEmployeeObligation,
  hrmFhcEvidenceLink,
  hrmFhcFoodHandlerPermit,
  hrmFhcHealthCertificate,
  hrmFhcTrainingCompletion,
  hrmFhcVerificationReview,
} from "@afenda/platform/db/schema"

import { HRM_FHC_AUDIT } from "../fhc.contract"
import { refreshFhcObligationComplianceStatus } from "./fhc-compliance-context.server"
import { assertFhcEvidenceDocumentForEmployee } from "./fhc-evidence-documents.server"
import { revalidateFhcSurfaces } from "./fhc-revalidate.server"

async function assertObligationInOrg(input: {
  organizationId: string
  obligationId: string
}) {
  const row = await db.query.hrmFhcEmployeeObligation.findFirst({
    where: eq(hrmFhcEmployeeObligation.id, input.obligationId),
    columns: {
      id: true,
      organizationId: true,
      employeeId: true,
    },
  })
  if (!row || row.organizationId !== input.organizationId) return null
  return row
}

export async function submitFhcFoodHandlerPermit(input: {
  organizationId: string
  userId: string
  obligationId: string
  permitNumber: string
  issuingAuthority: string | null
  issueDate: string | null
  expiryDate: string | null
}): Promise<{ ok: true; permitId: string } | { ok: false; form?: string }> {
  const obligation = await assertObligationInOrg({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  if (!obligation) {
    return { ok: false, form: "Obligation was not found." }
  }

  const permitNumber = input.permitNumber.trim()
  if (!permitNumber) {
    return { ok: false, form: "Permit number is required." }
  }

  const existing = await db.query.hrmFhcFoodHandlerPermit.findFirst({
    where: eq(hrmFhcFoodHandlerPermit.obligationId, input.obligationId),
    columns: { id: true },
  })

  const permitId = existing?.id ?? crypto.randomUUID()
  const permitStatus = "active"

  if (existing) {
    await db
      .update(hrmFhcFoodHandlerPermit)
      .set({
        permitNumber,
        issuingAuthority: input.issuingAuthority,
        issueDate: input.issueDate,
        expiryDate: input.expiryDate,
        permitStatus,
        renewalState: "not_due",
        updatedByUserId: input.userId,
        updatedAt: new Date(),
      })
      .where(eq(hrmFhcFoodHandlerPermit.id, permitId))
  } else {
    await db.insert(hrmFhcFoodHandlerPermit).values({
      id: permitId,
      organizationId: input.organizationId,
      employeeId: obligation.employeeId,
      obligationId: input.obligationId,
      permitNumber,
      issuingAuthority: input.issuingAuthority,
      issueDate: input.issueDate,
      expiryDate: input.expiryDate,
      permitStatus,
      createdByUserId: input.userId,
      updatedByUserId: input.userId,
    })
  }

  await db.insert(hrmFhcVerificationReview).values({
    id: crypto.randomUUID(),
    organizationId: input.organizationId,
    employeeId: obligation.employeeId,
    subjectKind: "permit",
    subjectId: permitId,
    verificationState: "pending_review",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.permitSubmit,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_permit",
    resourceId: permitId,
    metadata: {},
  })

  await refreshFhcObligationComplianceStatus({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  revalidateFhcSurfaces()

  return { ok: true, permitId }
}

export async function recordFhcTrainingCompletion(input: {
  organizationId: string
  userId: string
  obligationId: string
  trainingType: "hygiene" | "allergen"
  completedAt: Date
  trainingRecordId?: string | null
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const obligation = await assertObligationInOrg({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  if (!obligation) {
    return { ok: false, form: "Obligation was not found." }
  }

  const existing = await db.query.hrmFhcTrainingCompletion.findFirst({
    where: and(
      eq(hrmFhcTrainingCompletion.organizationId, input.organizationId),
      eq(hrmFhcTrainingCompletion.obligationId, input.obligationId),
      eq(hrmFhcTrainingCompletion.trainingType, input.trainingType)
    ),
    columns: { id: true },
  })

  if (existing) {
    await db
      .update(hrmFhcTrainingCompletion)
      .set({
        completedAt: input.completedAt,
        trainingRecordId: input.trainingRecordId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(hrmFhcTrainingCompletion.id, existing.id))
  } else {
    await db.insert(hrmFhcTrainingCompletion).values({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      employeeId: obligation.employeeId,
      obligationId: input.obligationId,
      trainingType: input.trainingType,
      completedAt: input.completedAt,
      trainingRecordId: input.trainingRecordId ?? null,
    })
  }

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.trainingRecord,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_training",
    resourceId: input.obligationId,
    metadata: { trainingType: input.trainingType },
  })

  await refreshFhcObligationComplianceStatus({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  revalidateFhcSurfaces()

  return { ok: true }
}

export async function submitFhcHealthCertificate(input: {
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
  const obligation = await assertObligationInOrg({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  if (!obligation) {
    return { ok: false, form: "Obligation was not found." }
  }

  const existing = await db.query.hrmFhcHealthCertificate.findFirst({
    where: eq(hrmFhcHealthCertificate.obligationId, input.obligationId),
    columns: { id: true, certificateRef: true },
  })

  const certificateId = existing?.id ?? crypto.randomUUID()
  const certificateRef = input.canPersistHealthCertificateRef
    ? input.certificateRef
    : (existing?.certificateRef ?? null)

  if (existing) {
    await db
      .update(hrmFhcHealthCertificate)
      .set({
        certificateRef,
        issuedAt: input.issuedAt,
        expiresAt: input.expiresAt,
        healthStatus: "active",
        updatedByUserId: input.userId,
        updatedAt: new Date(),
      })
      .where(eq(hrmFhcHealthCertificate.id, certificateId))
  } else {
    await db.insert(hrmFhcHealthCertificate).values({
      id: certificateId,
      organizationId: input.organizationId,
      employeeId: obligation.employeeId,
      obligationId: input.obligationId,
      certificateRef,
      issuedAt: input.issuedAt,
      expiresAt: input.expiresAt,
      healthStatus: "active",
      createdByUserId: input.userId,
      updatedByUserId: input.userId,
    })
  }

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.healthCertificateSubmit,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_health_certificate",
    resourceId: certificateId,
    metadata: {},
  })

  await refreshFhcObligationComplianceStatus({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  revalidateFhcSurfaces()

  return { ok: true, certificateId }
}

export async function linkFhcEvidenceDocument(input: {
  organizationId: string
  userId: string
  employeeId: string
  subjectKind: string
  subjectId: string
  documentId: string
}): Promise<{ ok: true; linkId: string } | { ok: false; form?: string }> {
  const documentCheck = await assertFhcEvidenceDocumentForEmployee({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    documentId: input.documentId,
  })
  if (!documentCheck.ok) {
    return { ok: false, form: documentCheck.form }
  }

  const documentId = input.documentId.trim()
  const linkId = crypto.randomUUID()
  await db.insert(hrmFhcEvidenceLink).values({
    id: linkId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    subjectKind: input.subjectKind,
    subjectId: input.subjectId,
    documentId,
    createdByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.evidenceLink,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_evidence",
    resourceId: linkId,
    metadata: { documentId },
  })

  revalidateFhcSurfaces()
  return { ok: true, linkId }
}
