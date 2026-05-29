"use server";

import {
  archiveHrEmployeeDocument,
  HrDocumentCommandError,
  registerHrEmployeeDocument,
  rejectHrEmployeeDocument,
  upsertHrDocumentRequirement,
  verifyHrEmployeeDocument,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  actionFailure,
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";
import { hrWorkforceRoutes } from "../../../contracts/hr-workforce-routes.shared";
import { hrDocumentAuditActions } from "../events/hr-documents.event";
import { requireHrDocumentsWrite } from "../policies/hr-documents.policy.server";
import {
  hrArchiveDocumentActionSchema,
  hrRegisterDocumentActionSchema,
  hrRejectDocumentActionSchema,
  hrUpsertDocumentRequirementActionSchema,
  hrVerifyDocumentActionSchema,
} from "../schemas/hr-document-mutation.schema";

function revalidateHrDocuments() {
  revalidatePath(hrWorkforceRoutes.documents);
}

function mapCommandError(error: unknown): ActionResult<never> {
  if (error instanceof HrDocumentCommandError) {
    return actionFailure(error.message, undefined, error.code);
  }
  return actionFailure(
    error instanceof Error ? error.message : "HR document mutation failed.",
    undefined,
    "unknown",
  );
}

export async function registerHrDocumentAction(
  formData: FormData,
): Promise<ActionResult<{ documentId: string }>> {
  const { context } = await requireHrDocumentsWrite();

  const parsed = hrRegisterDocumentActionSchema.safeParse({
    employeeId: formData.get("employeeId"),
    documentType: formData.get("documentType"),
    title: formData.get("title"),
    blobUrl: formData.get("blobUrl"),
    mimeType: formData.get("mimeType"),
    sizeBytes: formData.get("sizeBytes"),
    classification: formData.get("classification") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const effectiveFrom = parsed.data.effectiveFrom
      ? new Date(`${parsed.data.effectiveFrom}T00:00:00.000Z`)
      : undefined;
    const effectiveTo = parsed.data.effectiveTo
      ? new Date(`${parsed.data.effectiveTo}T00:00:00.000Z`)
      : undefined;

    const result = await registerHrEmployeeDocument({
      organizationId: context.organizationId,
      employeeId: parsed.data.employeeId,
      documentType: parsed.data.documentType,
      title: parsed.data.title,
      blobUrl: parsed.data.blobUrl,
      mimeType: parsed.data.mimeType,
      sizeBytes: parsed.data.sizeBytes,
      classification: parsed.data.classification,
      effectiveFrom,
      effectiveTo,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrDocumentAuditActions.register,
      targetType: "hr_employee_document",
      targetId: result.documentId,
      metadata: {
        employeeId: parsed.data.employeeId,
        documentType: parsed.data.documentType,
      },
    });

    revalidateHrDocuments();
    return actionSuccess({ documentId: result.documentId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function verifyHrDocumentAction(
  formData: FormData,
): Promise<ActionResult<{ documentId: string }>> {
  const { context } = await requireHrDocumentsWrite();

  const parsed = hrVerifyDocumentActionSchema.safeParse({
    documentId: formData.get("documentId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await verifyHrEmployeeDocument({
      organizationId: context.organizationId,
      documentId: parsed.data.documentId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrDocumentAuditActions.verify,
      targetType: "hr_employee_document",
      targetId: result.documentId,
    });

    revalidateHrDocuments();
    return actionSuccess({ documentId: result.documentId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function archiveHrDocumentAction(
  formData: FormData,
): Promise<ActionResult<{ documentId: string }>> {
  const { context } = await requireHrDocumentsWrite();

  const parsed = hrArchiveDocumentActionSchema.safeParse({
    documentId: formData.get("documentId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await archiveHrEmployeeDocument({
      organizationId: context.organizationId,
      documentId: parsed.data.documentId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrDocumentAuditActions.archive,
      targetType: "hr_employee_document",
      targetId: result.documentId,
    });

    revalidateHrDocuments();
    return actionSuccess({ documentId: result.documentId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function rejectHrDocumentAction(
  formData: FormData,
): Promise<ActionResult<{ documentId: string }>> {
  const { context } = await requireHrDocumentsWrite();

  const parsed = hrRejectDocumentActionSchema.safeParse({
    documentId: formData.get("documentId"),
    rejectionReason: formData.get("rejectionReason"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await rejectHrEmployeeDocument({
      organizationId: context.organizationId,
      documentId: parsed.data.documentId,
      rejectionReason: parsed.data.rejectionReason,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrDocumentAuditActions.reject,
      targetType: "hr_employee_document",
      targetId: result.documentId,
      metadata: { rejectionReason: parsed.data.rejectionReason },
    });

    revalidateHrDocuments();
    return actionSuccess({ documentId: result.documentId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function upsertHrDocumentRequirementAction(
  formData: FormData,
): Promise<ActionResult<{ requirementId: string }>> {
  const { context } = await requireHrDocumentsWrite();

  const statusRaw = formData.get("requiredForStatus");
  const parsed = hrUpsertDocumentRequirementActionSchema.safeParse({
    documentType: formData.get("documentType"),
    title: formData.get("title"),
    requiredForStatus:
      typeof statusRaw === "string" && statusRaw.length > 0 ? statusRaw : undefined,
    graceDaysBeforeDue: formData.get("graceDaysBeforeDue") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await upsertHrDocumentRequirement({
      organizationId: context.organizationId,
      documentType: parsed.data.documentType,
      title: parsed.data.title,
      requiredForStatus: parsed.data.requiredForStatus,
      graceDaysBeforeDue: parsed.data.graceDaysBeforeDue,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrDocumentAuditActions.upsertRequirement,
      targetType: "hr_document_requirement",
      targetId: result.requirementId,
    });

    revalidateHrDocuments();
    return actionSuccess({ requirementId: result.requirementId });
  } catch (error) {
    return mapCommandError(error);
  }
}
