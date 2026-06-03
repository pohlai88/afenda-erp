"use server";

import {
  authorizeHrEmployeeDocumentDownload,
  registerHrEmployeeDocument,
  rejectHrEmployeeDocument,
  replaceHrEmployeeDocument,
  recordHrDocumentAcknowledgment,
  upsertHrDocumentRequirement,
  upsertHrDocumentRetentionPolicy,
  verifyHrEmployeeDocument,
} from "@afenda/db";
import {
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";

import {
  requireHrDocumentsRead,
  requireHrDocumentsWrite,
  requireHrDocumentsSensitiveWrite,
} from "./hr.workforce.documents-access.policy.server";
import { readOptionalDocumentsFormField } from "./hr.workforce.documents-form.shared";
import {
  registerHrEmployeeDocumentFormSchema,
  rejectHrEmployeeDocumentFormSchema,
  replaceHrEmployeeDocumentFormSchema,
  recordHrDocumentAcknowledgmentFormSchema,
  upsertHrDocumentRequirementFormSchema,
  upsertHrDocumentRetentionPolicyFormSchema,
  verifyHrEmployeeDocumentFormSchema,
} from "./hr.workforce.documents-repository.schema";
import {
  isHrDocumentClassificationSensitive,
} from "./hr.workforce.documents-sensitive-access.shared";
import {
  finalizeDocumentsMutation,
  toDocumentsActionFailure,
} from "./hr.workforce.documents.mutation.shared.server";

export async function registerHrEmployeeDocumentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrDocumentsWrite();
  const parsed = registerHrEmployeeDocumentFormSchema.safeParse({
    employeeId: readOptionalDocumentsFormField(formData, "employeeId"),
    documentType: readOptionalDocumentsFormField(formData, "documentType"),
    title: readOptionalDocumentsFormField(formData, "title"),
    blobUrl: readOptionalDocumentsFormField(formData, "blobUrl"),
    pathname: readOptionalDocumentsFormField(formData, "pathname"),
    mimeType: readOptionalDocumentsFormField(formData, "mimeType"),
    sizeBytes: readOptionalDocumentsFormField(formData, "sizeBytes"),
    classification: readOptionalDocumentsFormField(formData, "classification"),
    effectiveFrom: readOptionalDocumentsFormField(formData, "effectiveFrom"),
    effectiveTo: readOptionalDocumentsFormField(formData, "effectiveTo"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  if (isHrDocumentClassificationSensitive(parsed.data.classification)) {
    try {
      await requireHrDocumentsSensitiveWrite();
    } catch (error) {
      return toDocumentsActionFailure(error);
    }
  }

  return finalizeDocumentsMutation(async () => {
    await registerHrEmployeeDocument({
      organizationId: guard.organization.id,
      ...parsed.data,
      actorUserId: guard.session.id,
    });
  });
}

export async function upsertHrDocumentRequirementAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrDocumentsWrite();
  const parsed = upsertHrDocumentRequirementFormSchema.safeParse({
    documentType: readOptionalDocumentsFormField(formData, "documentType"),
    title: readOptionalDocumentsFormField(formData, "title"),
    requiredForStatus: readOptionalDocumentsFormField(
      formData,
      "requiredForStatus",
    ),
    graceDaysBeforeDue: readOptionalDocumentsFormField(
      formData,
      "graceDaysBeforeDue",
    ),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeDocumentsMutation(async () => {
    await upsertHrDocumentRequirement({
      organizationId: guard.organization.id,
      documentType: parsed.data.documentType,
      title: parsed.data.title,
      requiredForStatus: parsed.data.requiredForStatus ?? null,
      graceDaysBeforeDue: parsed.data.graceDaysBeforeDue,
      actorUserId: guard.session.id,
    });
  });
}

export async function verifyHrEmployeeDocumentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrDocumentsWrite();
  const parsed = verifyHrEmployeeDocumentFormSchema.safeParse({
    documentId: readOptionalDocumentsFormField(formData, "documentId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeDocumentsMutation(async () => {
    await verifyHrEmployeeDocument({
      organizationId: guard.organization.id,
      documentId: parsed.data.documentId,
      actorUserId: guard.session.id,
    });
  });
}

export async function rejectHrEmployeeDocumentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrDocumentsWrite();
  const parsed = rejectHrEmployeeDocumentFormSchema.safeParse({
    documentId: readOptionalDocumentsFormField(formData, "documentId"),
    rejectionReason: readOptionalDocumentsFormField(formData, "rejectionReason"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeDocumentsMutation(async () => {
    await rejectHrEmployeeDocument({
      organizationId: guard.organization.id,
      documentId: parsed.data.documentId,
      rejectionReason: parsed.data.rejectionReason,
      actorUserId: guard.session.id,
    });
  });
}

export async function replaceHrEmployeeDocumentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrDocumentsWrite();
  const parsed = replaceHrEmployeeDocumentFormSchema.safeParse({
    documentId: readOptionalDocumentsFormField(formData, "documentId"),
    title: readOptionalDocumentsFormField(formData, "title"),
    blobUrl: readOptionalDocumentsFormField(formData, "blobUrl"),
    pathname: readOptionalDocumentsFormField(formData, "pathname"),
    mimeType: readOptionalDocumentsFormField(formData, "mimeType"),
    sizeBytes: readOptionalDocumentsFormField(formData, "sizeBytes"),
    effectiveTo: readOptionalDocumentsFormField(formData, "effectiveTo"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeDocumentsMutation(async () => {
    await replaceHrEmployeeDocument({
      organizationId: guard.organization.id,
      ...parsed.data,
      actorUserId: guard.session.id,
    });
  });
}

export async function upsertHrDocumentRetentionPolicyAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrDocumentsWrite();
  const parsed = upsertHrDocumentRetentionPolicyFormSchema.safeParse({
    documentType: readOptionalDocumentsFormField(formData, "documentType"),
    documentGroup: readOptionalDocumentsFormField(formData, "documentGroup"),
    retentionDays: readOptionalDocumentsFormField(formData, "retentionDays"),
    archiveOnSeparation: readOptionalDocumentsFormField(
      formData,
      "archiveOnSeparation",
    ),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeDocumentsMutation(async () => {
    await upsertHrDocumentRetentionPolicy({
      organizationId: guard.organization.id,
      documentType: parsed.data.documentType ?? null,
      documentGroup: parsed.data.documentGroup ?? null,
      retentionDays: parsed.data.retentionDays,
      archiveOnSeparation: parsed.data.archiveOnSeparation,
      actorUserId: guard.session.id,
    });
  });
}

export async function recordHrDocumentAcknowledgmentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrDocumentsWrite();
  const parsed = recordHrDocumentAcknowledgmentFormSchema.safeParse({
    employeeId: readOptionalDocumentsFormField(formData, "employeeId"),
    policyKey: readOptionalDocumentsFormField(formData, "policyKey"),
    policyVersion: readOptionalDocumentsFormField(formData, "policyVersion"),
    acknowledgmentMethod: readOptionalDocumentsFormField(
      formData,
      "acknowledgmentMethod",
    ),
    employeeDocumentId: readOptionalDocumentsFormField(
      formData,
      "employeeDocumentId",
    ),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeDocumentsMutation(async () => {
    await recordHrDocumentAcknowledgment({
      organizationId: guard.organization.id,
      ...parsed.data,
      employeeDocumentId: parsed.data.employeeDocumentId ?? null,
      actorUserId: guard.session.id,
    });
  });
}

export async function authorizeHrEmployeeDocumentDownloadAction(input: {
  documentId: string;
}) {
  const guard = await requireHrDocumentsRead();
  return authorizeHrEmployeeDocumentDownload({
    organizationId: guard.organization.id,
    documentId: input.documentId,
    actorUserId: guard.session.id,
    canViewSensitive: guard.canViewSensitive,
  });
}

export async function getHrEmployeeDocumentReadinessAction(input: {
  employeeId: string;
}) {
  const { organization } = await requireHrDocumentsRead();
  const { getHrEmployeeDocumentReadiness } = await import("@afenda/db");
  return getHrEmployeeDocumentReadiness({
    organizationId: organization.id,
    employeeId: input.employeeId,
  });
}
