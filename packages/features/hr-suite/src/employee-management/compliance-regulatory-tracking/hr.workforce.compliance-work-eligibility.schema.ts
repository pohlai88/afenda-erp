import { z } from "zod";

import { HRM_COMPLIANCE_WORK_ELIGIBILITY_STATUSES } from "./hr.workforce.compliance-work-eligibility.shared";
import {
  hrComplianceEntityIdSchema,
  hrComplianceFormNullableDateTimeInput,
  hrComplianceFormNullableReviewNotesInput,
  readComplianceFormTextField,
} from "./hr.workforce.compliance-form.shared";

export const updateHrWorkEligibilityFormSchema = z.object({
  workEligibilityId: hrComplianceEntityIdSchema,
  status: z.enum(HRM_COMPLIANCE_WORK_ELIGIBILITY_STATUSES),
  expiresAt: hrComplianceFormNullableDateTimeInput,
  reviewNotes: hrComplianceFormNullableReviewNotesInput,
});

export type UpdateHrWorkEligibilityFormInput = z.infer<
  typeof updateHrWorkEligibilityFormSchema
>;

export const ensureHrWorkEligibilityTrackingFormSchema = z.object({});

export function parseUpdateHrWorkEligibilityForm(formData: FormData) {
  return updateHrWorkEligibilityFormSchema.safeParse({
    workEligibilityId: readComplianceFormTextField(formData, "workEligibilityId"),
    status: readComplianceFormTextField(formData, "status"),
    expiresAt: readComplianceFormTextField(formData, "expiresAt"),
    reviewNotes: readComplianceFormTextField(formData, "reviewNotes"),
  });
}
