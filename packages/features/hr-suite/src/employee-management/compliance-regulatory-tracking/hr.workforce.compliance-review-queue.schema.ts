import { z } from "zod";

import { HR_COMPLIANCE_REVIEW_QUEUE_ENTRY_KINDS } from "@afenda/db";

import { readComplianceFormTextField } from "./hr.workforce.compliance-form.shared";

export const hrComplianceReviewQueueDecisionSchema = z.enum(["approve", "reject"]);

export const decideHrComplianceReviewQueueItemFormSchema = z
  .object({
    entryKind: z.enum(HR_COMPLIANCE_REVIEW_QUEUE_ENTRY_KINDS),
    sourceRecordId: z.string().trim().min(1),
    decision: hrComplianceReviewQueueDecisionSchema,
    reviewNotes: z.string().trim().max(2000).optional(),
  })
  .strict();

export function parseDecideHrComplianceReviewQueueItemForm(formData: FormData) {
  return decideHrComplianceReviewQueueItemFormSchema.safeParse({
    entryKind: readComplianceFormTextField(formData, "entryKind"),
    sourceRecordId: readComplianceFormTextField(formData, "sourceRecordId"),
    decision: readComplianceFormTextField(formData, "decision"),
    reviewNotes: formData.has("reviewNotes")
      ? readComplianceFormTextField(formData, "reviewNotes")
      : undefined,
  });
}
