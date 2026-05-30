import { z } from "zod";

import { HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES } from "../data/hr.workforce.compliance-status.shared";
import {
  hrComplianceEntityIdSchema,
  hrComplianceFormNullableDateTimeInput,
  hrComplianceFormNullableReviewNotesInput,
  readComplianceFormTextField,
} from "./hr.workforce.compliance-form.shared";

const complianceRequirementTrailingBaseSchema = z.object({
  requirementId: hrComplianceEntityIdSchema,
  status: z.enum(HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES),
  reviewNotes: hrComplianceFormNullableReviewNotesInput,
});

const complianceRequirementTrailingWithCertificationSchema =
  complianceRequirementTrailingBaseSchema.extend({
    certificationExpiresAt: hrComplianceFormNullableDateTimeInput,
  });

export const updateHrEmployeeLaborLawRequirementFormSchema =
  complianceRequirementTrailingBaseSchema;

export const updateHrEmployeeSafetyTrainingRequirementFormSchema =
  complianceRequirementTrailingWithCertificationSchema;

export const updateHrEmployeeWorkplaceSafetyRequirementFormSchema =
  complianceRequirementTrailingWithCertificationSchema;

export const updateHrEmployeePolicyAcknowledgementFormSchema =
  complianceRequirementTrailingBaseSchema;

export const updateHrEmployeeStatutoryRequirementFormSchema =
  complianceRequirementTrailingBaseSchema;

export type UpdateHrEmployeeLaborLawRequirementFormInput = z.infer<
  typeof updateHrEmployeeLaborLawRequirementFormSchema
>;

export type UpdateHrEmployeeSafetyTrainingRequirementFormInput = z.infer<
  typeof updateHrEmployeeSafetyTrainingRequirementFormSchema
>;

export type UpdateHrEmployeeWorkplaceSafetyRequirementFormInput = z.infer<
  typeof updateHrEmployeeWorkplaceSafetyRequirementFormSchema
>;

export type UpdateHrEmployeePolicyAcknowledgementFormInput = z.infer<
  typeof updateHrEmployeePolicyAcknowledgementFormSchema
>;

export type UpdateHrEmployeeStatutoryRequirementFormInput = z.infer<
  typeof updateHrEmployeeStatutoryRequirementFormSchema
>;

export function parseUpdateHrEmployeeLaborLawRequirementForm(formData: FormData) {
  return complianceRequirementTrailingBaseSchema.safeParse({
    requirementId: readComplianceFormTextField(formData, "requirementId"),
    status: readComplianceFormTextField(formData, "status"),
    reviewNotes: readComplianceFormTextField(formData, "reviewNotes"),
  });
}

export function parseUpdateHrEmployeeSafetyTrainingRequirementForm(
  formData: FormData,
) {
  return complianceRequirementTrailingWithCertificationSchema.safeParse({
    requirementId: readComplianceFormTextField(formData, "requirementId"),
    status: readComplianceFormTextField(formData, "status"),
    reviewNotes: readComplianceFormTextField(formData, "reviewNotes"),
    certificationExpiresAt: readComplianceFormTextField(
      formData,
      "certificationExpiresAt",
    ),
  });
}

export function parseUpdateHrEmployeeWorkplaceSafetyRequirementForm(
  formData: FormData,
) {
  return complianceRequirementTrailingWithCertificationSchema.safeParse({
    requirementId: readComplianceFormTextField(formData, "requirementId"),
    status: readComplianceFormTextField(formData, "status"),
    reviewNotes: readComplianceFormTextField(formData, "reviewNotes"),
    certificationExpiresAt: readComplianceFormTextField(
      formData,
      "certificationExpiresAt",
    ),
  });
}

export function parseUpdateHrEmployeePolicyAcknowledgementForm(formData: FormData) {
  return complianceRequirementTrailingBaseSchema.safeParse({
    requirementId: readComplianceFormTextField(formData, "requirementId"),
    status: readComplianceFormTextField(formData, "status"),
    reviewNotes: readComplianceFormTextField(formData, "reviewNotes"),
  });
}

export function parseUpdateHrEmployeeStatutoryRequirementForm(formData: FormData) {
  return complianceRequirementTrailingBaseSchema.safeParse({
    requirementId: readComplianceFormTextField(formData, "requirementId"),
    status: readComplianceFormTextField(formData, "status"),
    reviewNotes: readComplianceFormTextField(formData, "reviewNotes"),
  });
}
