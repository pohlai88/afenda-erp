import { z } from "zod";

import { HRM_COMPLIANCE_WORK_ELIGIBILITY_STATUSES } from "../data/hr.workforce.compliance-work-eligibility.shared";
import { hrComplianceFormDateTimeInput } from "./hr.workforce.compliance-form.shared";

const uuid = z.string().uuid();

export const updateHrWorkEligibilityFormSchema = z.object({
  workEligibilityId: uuid,
  status: z.enum(HRM_COMPLIANCE_WORK_ELIGIBILITY_STATUSES),
  expiresAt: hrComplianceFormDateTimeInput.optional(),
  reviewNotes: z.string().trim().max(2000).optional(),
});

export type UpdateHrWorkEligibilityFormInput = z.infer<
  typeof updateHrWorkEligibilityFormSchema
>;

export const ensureHrWorkEligibilityTrackingFormSchema = z.object({});
