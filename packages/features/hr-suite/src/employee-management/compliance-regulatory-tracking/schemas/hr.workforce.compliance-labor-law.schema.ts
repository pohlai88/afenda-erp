import { z } from "zod";

import { HRM_COMPLIANCE_REQUIREMENT_STATUSES } from "../data/hr.workforce.compliance-status.shared";

const uuid = z.string().uuid();

export const updateHrEmployeeLaborLawRequirementFormSchema = z.object({
  requirementId: uuid,
  status: z.enum(HRM_COMPLIANCE_REQUIREMENT_STATUSES),
  reviewNotes: z.string().trim().max(2000).optional(),
});

export type UpdateHrEmployeeLaborLawRequirementFormInput = z.infer<
  typeof updateHrEmployeeLaborLawRequirementFormSchema
>;

export const syncHrEmployeeLaborLawRequirementsFormSchema = z.object({});
