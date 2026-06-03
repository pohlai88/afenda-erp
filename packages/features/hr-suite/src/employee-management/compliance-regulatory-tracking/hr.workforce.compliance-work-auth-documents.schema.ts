import { z } from "zod";

import { HRM_COMPLIANCE_WORK_AUTH_DOCUMENT_STATUSES } from "./hr.workforce.compliance-work-auth-documents.shared";
import {
  hrComplianceEntityIdSchema,
  hrComplianceFormNullableDateTimeInput,
  hrComplianceFormNullableDocumentNumberInput,
  hrComplianceFormNullableReviewNotesInput,
  readComplianceFormTextField,
} from "./hr.workforce.compliance-form.shared";

export const updateHrWorkAuthorizationDocumentFormSchema = z.object({
  workAuthDocumentId: hrComplianceEntityIdSchema,
  status: z.enum(HRM_COMPLIANCE_WORK_AUTH_DOCUMENT_STATUSES),
  documentNumber: hrComplianceFormNullableDocumentNumberInput,
  issuedAt: hrComplianceFormNullableDateTimeInput,
  expiresAt: hrComplianceFormNullableDateTimeInput,
  reviewNotes: hrComplianceFormNullableReviewNotesInput,
});

export type UpdateHrWorkAuthorizationDocumentFormInput = z.infer<
  typeof updateHrWorkAuthorizationDocumentFormSchema
>;

export const ensureHrWorkAuthorizationDocumentsFormSchema = z.object({});

export function parseUpdateHrWorkAuthorizationDocumentForm(formData: FormData) {
  return updateHrWorkAuthorizationDocumentFormSchema.safeParse({
    workAuthDocumentId: readComplianceFormTextField(formData, "workAuthDocumentId"),
    status: readComplianceFormTextField(formData, "status"),
    documentNumber: readComplianceFormTextField(formData, "documentNumber"),
    issuedAt: readComplianceFormTextField(formData, "issuedAt"),
    expiresAt: readComplianceFormTextField(formData, "expiresAt"),
    reviewNotes: readComplianceFormTextField(formData, "reviewNotes"),
  });
}
