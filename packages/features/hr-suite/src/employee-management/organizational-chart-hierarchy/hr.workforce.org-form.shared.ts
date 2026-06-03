import { z } from "zod";

export function readOptionalOrgFormField(
  formData: FormData,
  key: string,
): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const hrOrgUnitTypeSchema = z.enum([
  "legal_entity",
  "business_unit",
  "department",
  "sub_department",
  "team",
  "location",
]);

export const hrOrgUnitStatusSchema = z.enum([
  "active",
  "planned",
  "frozen",
  "closed",
]);

export const hrReportingRelationshipTypeSchema = z.enum([
  "direct",
  "dotted_line",
  "matrix",
]);

export const upsertHrOrgUnitFormSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  unitType: hrOrgUnitTypeSchema,
  parentDepartmentId: z.string().optional(),
  managerEmployeeId: z.string().optional(),
  costCenterCode: z.string().optional(),
  locationCode: z.string().optional(),
  legalEntityCode: z.string().optional(),
  orgUnitStatus: hrOrgUnitStatusSchema.optional(),
  effectiveFrom: z.string().optional(),
});

export const upsertHrOrgPositionFormSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  title: z.string().min(1, "Title is required"),
  departmentId: z.string().min(1, "Organization unit is required"),
  managerEmployeeId: z.string().optional(),
  costCenterCode: z.string().optional(),
  locationCode: z.string().optional(),
  positionStatus: hrOrgUnitStatusSchema.optional(),
  effectiveFrom: z.string().optional(),
});

export const upsertHrReportingRelationshipFormSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Employee is required"),
  managerEmployeeId: z.string().min(1, "Manager is required"),
  relationshipType: hrReportingRelationshipTypeSchema,
  effectiveFrom: z.string().optional(),
  reason: z.string().optional(),
});
