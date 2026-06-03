import { z } from "zod";

import { hrRecordsEmploymentStatusSchema } from "./hr.workforce.records-employment-status.schema";

const optionalTrimmedString = z.string().trim().optional().or(z.literal(""));
const hrRecordsIdentityDocumentTypeSchema = z
  .enum(["national_id", "passport", "work_permit", "other"])
  .optional();

export const hrRecordsCreateEmployeeSchema = z.object({
  employeeNumber: z.string().trim().min(1, "Employee number is required"),
  legalName: z.string().trim().min(1, "Legal name is required"),
  preferredName: optionalTrimmedString,
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  employmentStartDate: z.coerce.date().optional(),
  employmentType: optionalTrimmedString,
  workerCategory: optionalTrimmedString,
  grade: optionalTrimmedString,
  level: optionalTrimmedString,
  legalEntityCode: optionalTrimmedString,
  workLocationCode: optionalTrimmedString,
  countryCode: optionalTrimmedString,
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  currentDepartmentId: optionalTrimmedString,
  currentPositionId: optionalTrimmedString,
  managerEmployeeId: optionalTrimmedString,
  matrixManagerEmployeeId: optionalTrimmedString,
  hrOwnerEmployeeId: optionalTrimmedString,
  identityDocumentType: hrRecordsIdentityDocumentTypeSchema,
  identityNumber: optionalTrimmedString,
  nationality: optionalTrimmedString,
  dateOfBirth: z.coerce.date().optional(),
  gender: optionalTrimmedString,
  maritalStatus: optionalTrimmedString,
  languagePreference: optionalTrimmedString,
  phoneNumber: optionalTrimmedString,
  personalEmail: z
    .string()
    .trim()
    .email("Enter a valid personal email")
    .optional()
    .or(z.literal("")),
  residentialAddress: optionalTrimmedString,
  mailingAddress: optionalTrimmedString,
  emergencyContactName: optionalTrimmedString,
  emergencyContactRelationship: optionalTrimmedString,
  emergencyContactPhoneNumber: optionalTrimmedString,
});

export const hrRecordsUpdateEmployeeSchema = z.object({
  employeeId: z.string().min(1),
  employeeNumber: z.string().trim().min(1).optional(),
  legalName: z.string().trim().min(1).optional(),
  preferredName: optionalTrimmedString,
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  employmentStatus: hrRecordsEmploymentStatusSchema.optional(),
  employmentStartDate: z.coerce.date().optional(),
  employmentType: optionalTrimmedString,
  workerCategory: optionalTrimmedString,
  grade: optionalTrimmedString,
  level: optionalTrimmedString,
  legalEntityCode: optionalTrimmedString,
  workLocationCode: optionalTrimmedString,
  countryCode: optionalTrimmedString,
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  matrixManagerEmployeeId: optionalTrimmedString,
  hrOwnerEmployeeId: optionalTrimmedString,
  identityDocumentType: hrRecordsIdentityDocumentTypeSchema,
  identityNumber: optionalTrimmedString,
  nationality: optionalTrimmedString,
  dateOfBirth: z.coerce.date().optional(),
  gender: optionalTrimmedString,
  maritalStatus: optionalTrimmedString,
  languagePreference: optionalTrimmedString,
  phoneNumber: optionalTrimmedString,
  personalEmail: z
    .string()
    .trim()
    .email("Enter a valid personal email")
    .optional()
    .or(z.literal("")),
  residentialAddress: optionalTrimmedString,
  mailingAddress: optionalTrimmedString,
  emergencyContactName: optionalTrimmedString,
  emergencyContactRelationship: optionalTrimmedString,
  emergencyContactPhoneNumber: optionalTrimmedString,
  reason: z.string().trim().max(2000).optional(),
  approvalReference: z.string().trim().max(500).optional(),
});

export const hrRecordsAssignmentSchema = z.object({
  employeeId: z.string().min(1),
  currentDepartmentId: optionalTrimmedString,
  currentPositionId: optionalTrimmedString,
  managerEmployeeId: optionalTrimmedString,
  assignmentEffectiveFrom: z.coerce.date().optional(),
  assignmentReason: z.string().trim().max(2000).optional(),
  reason: z.string().trim().max(2000).optional(),
});

export const hrRecordsRehireEmployeeSchema = z.object({
  priorEmployeeId: z.string().min(1),
  employeeNumber: z.string().trim().min(1, "Employee number is required"),
  legalName: z.string().trim().min(1, "Legal name is required"),
  preferredName: optionalTrimmedString,
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  employmentStartDate: z.coerce.date().optional(),
  reason: z.string().trim().max(2000).optional(),
});

export const hrRecordsArchiveEmployeeSchema = z.object({
  employeeId: z.string().min(1),
  reason: z.string().trim().min(1, "Reason is required").max(2000),
  approvalReference: z.string().trim().max(500).optional(),
});

export type HrRecordsCreateEmployeeInput = z.infer<
  typeof hrRecordsCreateEmployeeSchema
>;
export type HrRecordsUpdateEmployeeInput = z.infer<
  typeof hrRecordsUpdateEmployeeSchema
>;
export type HrRecordsAssignmentInput = z.infer<typeof hrRecordsAssignmentSchema>;
export type HrRecordsRehireEmployeeInput = z.infer<
  typeof hrRecordsRehireEmployeeSchema
>;
export type HrRecordsArchiveEmployeeInput = z.infer<
  typeof hrRecordsArchiveEmployeeSchema
>;

function readRecordsFormField(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseHrRecordsCreateEmployeeForm(formData: FormData) {
  return hrRecordsCreateEmployeeSchema.safeParse({
    employeeNumber: formData.get("employeeNumber"),
    legalName: formData.get("legalName"),
    preferredName: readRecordsFormField(formData, "preferredName"),
    email: readRecordsFormField(formData, "email"),
    employmentStartDate: readRecordsFormField(formData, "employmentStartDate"),
    employmentType: readRecordsFormField(formData, "employmentType"),
    workerCategory: readRecordsFormField(formData, "workerCategory"),
    grade: readRecordsFormField(formData, "grade"),
    level: readRecordsFormField(formData, "level"),
    legalEntityCode: readRecordsFormField(formData, "legalEntityCode"),
    workLocationCode: readRecordsFormField(formData, "workLocationCode"),
    countryCode: readRecordsFormField(formData, "countryCode"),
    contractStartDate: readRecordsFormField(formData, "contractStartDate"),
    contractEndDate: readRecordsFormField(formData, "contractEndDate"),
    currentDepartmentId: readRecordsFormField(formData, "currentDepartmentId"),
    currentPositionId: readRecordsFormField(formData, "currentPositionId"),
    managerEmployeeId: readRecordsFormField(formData, "managerEmployeeId"),
    matrixManagerEmployeeId: readRecordsFormField(
      formData,
      "matrixManagerEmployeeId",
    ),
    hrOwnerEmployeeId: readRecordsFormField(formData, "hrOwnerEmployeeId"),
    identityDocumentType: readRecordsFormField(formData, "identityDocumentType"),
    identityNumber: readRecordsFormField(formData, "identityNumber"),
    nationality: readRecordsFormField(formData, "nationality"),
    dateOfBirth: readRecordsFormField(formData, "dateOfBirth"),
    gender: readRecordsFormField(formData, "gender"),
    maritalStatus: readRecordsFormField(formData, "maritalStatus"),
    languagePreference: readRecordsFormField(formData, "languagePreference"),
    phoneNumber: readRecordsFormField(formData, "phoneNumber"),
    personalEmail: readRecordsFormField(formData, "personalEmail"),
    residentialAddress: readRecordsFormField(formData, "residentialAddress"),
    mailingAddress: readRecordsFormField(formData, "mailingAddress"),
    emergencyContactName: readRecordsFormField(formData, "emergencyContactName"),
    emergencyContactRelationship: readRecordsFormField(
      formData,
      "emergencyContactRelationship",
    ),
    emergencyContactPhoneNumber: readRecordsFormField(
      formData,
      "emergencyContactPhoneNumber",
    ),
  });
}

export function parseHrRecordsUpdateEmployeeForm(formData: FormData) {
  return hrRecordsUpdateEmployeeSchema.safeParse({
    employeeId: formData.get("employeeId"),
    employeeNumber: readRecordsFormField(formData, "employeeNumber"),
    legalName: readRecordsFormField(formData, "legalName"),
    preferredName: readRecordsFormField(formData, "preferredName"),
    email: readRecordsFormField(formData, "email"),
    employmentStatus: readRecordsFormField(formData, "employmentStatus"),
    employmentStartDate: readRecordsFormField(formData, "employmentStartDate"),
    employmentType: readRecordsFormField(formData, "employmentType"),
    workerCategory: readRecordsFormField(formData, "workerCategory"),
    grade: readRecordsFormField(formData, "grade"),
    level: readRecordsFormField(formData, "level"),
    legalEntityCode: readRecordsFormField(formData, "legalEntityCode"),
    workLocationCode: readRecordsFormField(formData, "workLocationCode"),
    countryCode: readRecordsFormField(formData, "countryCode"),
    contractStartDate: readRecordsFormField(formData, "contractStartDate"),
    contractEndDate: readRecordsFormField(formData, "contractEndDate"),
    matrixManagerEmployeeId: readRecordsFormField(
      formData,
      "matrixManagerEmployeeId",
    ),
    hrOwnerEmployeeId: readRecordsFormField(formData, "hrOwnerEmployeeId"),
    identityDocumentType: readRecordsFormField(formData, "identityDocumentType"),
    identityNumber: readRecordsFormField(formData, "identityNumber"),
    nationality: readRecordsFormField(formData, "nationality"),
    dateOfBirth: readRecordsFormField(formData, "dateOfBirth"),
    gender: readRecordsFormField(formData, "gender"),
    maritalStatus: readRecordsFormField(formData, "maritalStatus"),
    languagePreference: readRecordsFormField(formData, "languagePreference"),
    phoneNumber: readRecordsFormField(formData, "phoneNumber"),
    personalEmail: readRecordsFormField(formData, "personalEmail"),
    residentialAddress: readRecordsFormField(formData, "residentialAddress"),
    mailingAddress: readRecordsFormField(formData, "mailingAddress"),
    emergencyContactName: readRecordsFormField(formData, "emergencyContactName"),
    emergencyContactRelationship: readRecordsFormField(
      formData,
      "emergencyContactRelationship",
    ),
    emergencyContactPhoneNumber: readRecordsFormField(
      formData,
      "emergencyContactPhoneNumber",
    ),
    reason: readRecordsFormField(formData, "reason"),
    approvalReference: readRecordsFormField(formData, "approvalReference"),
  });
}

export function parseHrRecordsAssignmentForm(formData: FormData) {
  return hrRecordsAssignmentSchema.safeParse({
    employeeId: formData.get("employeeId"),
    currentDepartmentId: readRecordsFormField(formData, "currentDepartmentId"),
    currentPositionId: readRecordsFormField(formData, "currentPositionId"),
    managerEmployeeId: readRecordsFormField(formData, "managerEmployeeId"),
    assignmentEffectiveFrom: readRecordsFormField(formData, "assignmentEffectiveFrom"),
    assignmentReason: readRecordsFormField(formData, "assignmentReason"),
    reason: readRecordsFormField(formData, "reason"),
  });
}

export function parseHrRecordsRehireEmployeeForm(formData: FormData) {
  return hrRecordsRehireEmployeeSchema.safeParse({
    priorEmployeeId: formData.get("priorEmployeeId"),
    employeeNumber: formData.get("employeeNumber"),
    legalName: formData.get("legalName"),
    preferredName: readRecordsFormField(formData, "preferredName"),
    email: readRecordsFormField(formData, "email"),
    employmentStartDate: readRecordsFormField(formData, "employmentStartDate"),
    reason: readRecordsFormField(formData, "reason"),
  });
}

export function parseHrRecordsArchiveEmployeeForm(formData: FormData) {
  return hrRecordsArchiveEmployeeSchema.safeParse({
    employeeId: formData.get("employeeId"),
    reason: formData.get("reason"),
    approvalReference: readRecordsFormField(formData, "approvalReference"),
  });
}
