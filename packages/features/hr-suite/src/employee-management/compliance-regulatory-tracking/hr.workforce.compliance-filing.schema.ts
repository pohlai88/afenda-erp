import { z } from "zod";

import { HRM_COMPLIANCE_FILING_STORED_STATUSES } from "./hr.workforce.compliance-filing.shared";
import {
  hrComplianceEntityIdSchema,
  hrComplianceFormNullableDateTimeInput,
  hrComplianceFormNullableReviewNotesInput,
  readComplianceFormTextField,
} from "./hr.workforce.compliance-form.shared";

export const syncHrComplianceFilingsFormSchema = z.object({});

export const updateHrComplianceFilingFormSchema = z.object({
  filingId: hrComplianceEntityIdSchema,
  status: z.enum(HRM_COMPLIANCE_FILING_STORED_STATUSES),
  filingDeadline: hrComplianceFormNullableDateTimeInput,
  reviewNotes: hrComplianceFormNullableReviewNotesInput,
});

export type UpdateHrComplianceFilingFormInput = z.infer<
  typeof updateHrComplianceFilingFormSchema
>;

export function parseUpdateHrComplianceFilingForm(formData: FormData) {
  return updateHrComplianceFilingFormSchema.safeParse({
    filingId: readComplianceFormTextField(formData, "filingId"),
    status: readComplianceFormTextField(formData, "status"),
    filingDeadline: readComplianceFormTextField(formData, "filingDeadline"),
    reviewNotes: readComplianceFormTextField(formData, "reviewNotes"),
  });
}
