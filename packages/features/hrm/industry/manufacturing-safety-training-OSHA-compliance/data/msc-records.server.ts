import "server-only"

import { and, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmMscEmployeeObligation,
  hrmMscSafetyCertification,
  hrmMscTrainingCompletion,
} from "@afenda/platform/db/schema"

import { HRM_MSC_AUDIT } from "../msc.contract"
import { refreshMscObligationComplianceStatus } from "./msc-compliance-context.server"
import { revalidateMscSurfaces } from "./msc-revalidate.server"
import type { HrmMscTrainingCategory } from "../schemas/msc-workflow-state.shared"

async function assertMscObligationInOrg(input: {
  organizationId: string
  obligationId: string
}) {
  const row = await db.query.hrmMscEmployeeObligation.findFirst({
    where: eq(hrmMscEmployeeObligation.id, input.obligationId),
    columns: {
      id: true,
      organizationId: true,
      employeeId: true,
    },
  })
  if (!row || row.organizationId !== input.organizationId) return null
  return row
}

export async function recordMscTrainingCompletion(input: {
  organizationId: string
  userId: string
  obligationId: string
  trainingCategory: HrmMscTrainingCategory
  completedAt: Date
  ppeAcknowledged?: boolean
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const obligation = await assertMscObligationInOrg({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  if (!obligation) {
    return { ok: false, form: "Obligation was not found." }
  }

  const existing = await db.query.hrmMscTrainingCompletion.findFirst({
    where: and(
      eq(hrmMscTrainingCompletion.organizationId, input.organizationId),
      eq(hrmMscTrainingCompletion.obligationId, input.obligationId),
      eq(hrmMscTrainingCompletion.trainingCategory, input.trainingCategory)
    ),
    columns: { id: true },
  })

  if (existing) {
    await db
      .update(hrmMscTrainingCompletion)
      .set({
        completionStatus: "completed",
        completedAt: input.completedAt,
        ppeAcknowledged: input.ppeAcknowledged ?? false,
        updatedByUserId: input.userId,
        updatedAt: new Date(),
      })
      .where(eq(hrmMscTrainingCompletion.id, existing.id))
  } else {
    await db.insert(hrmMscTrainingCompletion).values({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      employeeId: obligation.employeeId,
      obligationId: input.obligationId,
      trainingCategory: input.trainingCategory,
      completionStatus: "completed",
      completedAt: input.completedAt,
      ppeAcknowledged: input.ppeAcknowledged ?? false,
      createdByUserId: input.userId,
      updatedByUserId: input.userId,
    })
  }

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.trainingRecord,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "manufacturing_safety_training",
    resourceId: input.obligationId,
    metadata: { trainingCategory: input.trainingCategory },
  })

  await refreshMscObligationComplianceStatus({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  revalidateMscSurfaces()
  return { ok: true }
}

export async function recordMscSafetyCertification(input: {
  organizationId: string
  userId: string
  obligationId: string
  certificationType: string
  certificateRef: string | null
  issueDate: string | null
  expiryDate: string | null
}): Promise<
  { ok: true; certificationId: string } | { ok: false; form?: string }
> {
  const obligation = await assertMscObligationInOrg({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  if (!obligation) {
    return { ok: false, form: "Obligation was not found." }
  }

  const existing = await db.query.hrmMscSafetyCertification.findFirst({
    where: eq(hrmMscSafetyCertification.obligationId, input.obligationId),
    columns: { id: true },
  })

  const certificationId = existing?.id ?? crypto.randomUUID()
  const certStatus = "active"

  if (existing) {
    await db
      .update(hrmMscSafetyCertification)
      .set({
        certificationType: input.certificationType.trim() || "general",
        certificateRef: input.certificateRef?.trim() || null,
        issueDate: input.issueDate,
        expiryDate: input.expiryDate,
        certStatus,
        updatedByUserId: input.userId,
        updatedAt: new Date(),
      })
      .where(eq(hrmMscSafetyCertification.id, certificationId))
  } else {
    await db.insert(hrmMscSafetyCertification).values({
      id: certificationId,
      organizationId: input.organizationId,
      employeeId: obligation.employeeId,
      obligationId: input.obligationId,
      certificationType: input.certificationType.trim() || "general",
      certificateRef: input.certificateRef?.trim() || null,
      issueDate: input.issueDate,
      expiryDate: input.expiryDate,
      certStatus,
      createdByUserId: input.userId,
      updatedByUserId: input.userId,
    })
  }

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.certificationRecord,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "manufacturing_safety_certification",
    resourceId: certificationId,
    metadata: {},
  })

  await refreshMscObligationComplianceStatus({
    organizationId: input.organizationId,
    obligationId: input.obligationId,
  })
  revalidateMscSurfaces()
  return { ok: true, certificationId }
}
