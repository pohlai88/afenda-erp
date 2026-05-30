import { z } from "zod";

export const hrBenefitsProviderFormSchema = z.object({
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(256),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  contactPhone: z.string().trim().max(64).optional().or(z.literal("")),
  externalReference: z.string().trim().max(256).optional().or(z.literal("")),
});

export const hrBenefitsEnrollmentApprovalFormSchema = z.object({
  enrollmentId: z.string().trim().min(1),
  approvalReference: z.string().trim().max(256).optional().or(z.literal("")),
});

export const hrBenefitsEnrollmentChangeFormSchema = z.object({
  enrollmentId: z.string().trim().min(1),
  changeKind: z.enum([
    "plan_change",
    "coverage_change",
    "dependent_change",
    "contribution_change",
  ]),
  notes: z.string().trim().max(512).optional().or(z.literal("")),
  effectiveFrom: z.coerce.date().optional(),
  planId: z.string().trim().optional(),
  coverageLevel: z
    .enum(["employee_only", "employee_spouse", "employee_children", "family"])
    .optional(),
  dependentId: z.string().trim().optional(),
  dependentName: z.string().trim().optional(),
  dependentRelationship: z
    .enum(["spouse", "child", "domestic_partner", "other"])
    .optional(),
  dependentReferenceId: z.string().trim().optional(),
  dependentCoverageStartDate: z.coerce.date().optional(),
  removeDependent: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  contributionAmount: z.string().trim().optional(),
  contributionFrequency: z
    .enum(["per_payroll", "monthly", "quarterly", "annual"])
    .optional(),
});

export const hrBenefitsDocumentLinkFormSchema = z.object({
  recordKind: z.enum(["plan", "enrollment", "dependent", "life_event"]),
  recordId: z.string().trim().min(1),
  employeeDocumentId: z.string().trim().optional(),
  externalReference: z.string().trim().optional(),
  documentKind: z.string().trim().min(1).max(128),
  notes: z.string().trim().max(512).optional().or(z.literal("")),
});

export const hrBenefitsDocumentUnlinkFormSchema = z.object({
  documentLinkId: z.string().trim().min(1),
});

export const hrBenefitsPayrollExportFormSchema = z.object({
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
});
