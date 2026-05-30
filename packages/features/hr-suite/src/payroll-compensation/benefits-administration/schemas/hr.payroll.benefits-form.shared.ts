import { z } from "zod";

import {
  hrBenefitsDocumentLinkFormSchema,
  hrBenefitsDocumentUnlinkFormSchema,
  hrBenefitsEnrollmentApprovalFormSchema,
  hrBenefitsEnrollmentChangeFormSchema,
  hrBenefitsPayrollExportFormSchema,
  hrBenefitsProviderFormSchema,
} from "./hr.payroll.benefits-mutation.schema";
import {
  addHrBenefitEnrollmentDependentFormSchema,
  createHrBenefitEnrollmentFormSchema,
  verifyHrBenefitEnrollmentDependentsFormSchema,
} from "./hr.payroll.benefits-enrollment.schema";

export * from "./hr.payroll.benefits-constants.shared";
export * from "./hr.payroll.benefits-form-fields.shared";

export function formatBenefitsEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function readOptionalBenefitsFormField(
  formData: FormData,
  key: string,
): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function formDataToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}

function parseForm<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  formData: FormData,
) {
  return schema.safeParse(formDataToObject(formData));
}

export function parseHrBenefitsProviderForm(formData: FormData) {
  return parseForm(hrBenefitsProviderFormSchema, formData);
}

export function parseHrBenefitsEnrollmentApprovalForm(formData: FormData) {
  return parseForm(hrBenefitsEnrollmentApprovalFormSchema, formData);
}

export function parseHrBenefitsEnrollmentChangeForm(formData: FormData) {
  return parseForm(hrBenefitsEnrollmentChangeFormSchema, formData);
}

export function parseHrBenefitsEnrollmentCreateForm(formData: FormData) {
  return parseForm(createHrBenefitEnrollmentFormSchema, formData);
}

export function parseHrBenefitsAddDependentForm(formData: FormData) {
  return parseForm(addHrBenefitEnrollmentDependentFormSchema, formData);
}

export function parseHrBenefitsVerifyDependentsForm(formData: FormData) {
  return parseForm(verifyHrBenefitEnrollmentDependentsFormSchema, formData);
}

export function parseHrBenefitsDocumentLinkForm(formData: FormData) {
  return parseForm(hrBenefitsDocumentLinkFormSchema, formData);
}

export function parseHrBenefitsDocumentUnlinkForm(formData: FormData) {
  return parseForm(hrBenefitsDocumentUnlinkFormSchema, formData);
}

export function parseHrBenefitsPayrollExportForm(formData: FormData) {
  return parseForm(hrBenefitsPayrollExportFormSchema, formData);
}
