import { z } from "zod";

import { hrRecordsEmploymentStatusSchema } from "./hr.workforce.records-employment-status.schema";

const optionalTrimmedString = z.string().trim().optional().or(z.literal(""));

export const hrRecordsCreateEmployeeSchema = z.object({
  employeeNumber: z.string().trim().min(1, "Employee number is required"),
  legalName: z.string().trim().min(1, "Legal name is required"),
  preferredName: optionalTrimmedString,
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  employmentStartDate: z.coerce.date().optional(),
  employmentType: optionalTrimmedString,
  identityNumber: optionalTrimmedString,
  phoneNumber: optionalTrimmedString,
  personalEmail: z
    .string()
    .trim()
    .email("Enter a valid personal email")
    .optional()
    .or(z.literal("")),
});

export const hrRecordsUpdateEmployeeSchema = z.object({
  employeeId: z.string().min(1),
  employeeNumber: z.string().trim().min(1).optional(),
  legalName: z.string().trim().min(1).optional(),
  preferredName: optionalTrimmedString,
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  employmentStatus: hrRecordsEmploymentStatusSchema.optional(),
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
    identityNumber: readRecordsFormField(formData, "identityNumber"),
    phoneNumber: readRecordsFormField(formData, "phoneNumber"),
    personalEmail: readRecordsFormField(formData, "personalEmail"),
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
