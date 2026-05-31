import { z } from "zod";

import { hrMcpEmployeeClassificationSnapshotSchema } from "./hr.payroll.mcp-employee-classification.schema";
import {
  hrMcpCountryCodeSchema,
  hrMcpEntityIdSchema,
  hrMcpMoneyAmountSchema,
} from "./hr.payroll.mcp-form-fields.shared";

export {
  HR_MCP_TAX_RESIDENCY_VALUES,
  HR_MCP_WORKER_CATEGORY_VALUES,
  HR_MCP_STATUTORY_ELIGIBILITY_VALUES,
  type HrMcpTaxResidency,
  type HrMcpWorkerCategory,
  type HrMcpStatutoryEligibility,
} from "./hr.payroll.mcp-constants.shared";

export type { HrMcpEmployeeClassificationSnapshot } from "./hr.payroll.mcp-employee-classification.schema";

export { hrMcpEmployeeClassificationSnapshotSchema };

export const HR_MCP_STATUTORY_READINESS_CHECK_CODES = [
  "tax_id",
  "statutory_id",
  "classification",
  "legal_entity_assignment",
] as const;

export type HrMcpStatutoryReadinessCheckCode =
  (typeof HR_MCP_STATUTORY_READINESS_CHECK_CODES)[number];

export const HR_MCP_THRESHOLD_VIOLATION_CODES = [
  "below_minimum_wage",
  "above_statutory_ceiling",
  "contribution_threshold_exceeded",
  "tax_threshold_exceeded",
] as const;

export type HrMcpThresholdViolationCode =
  (typeof HR_MCP_THRESHOLD_VIOLATION_CODES)[number];

/** MCP-015 — employee profile slice used for statutory readiness validation. */
export const hrMcpStatutoryReadinessInputSchema = z.object({
  employeeId: hrMcpEntityIdSchema,
  countryCode: hrMcpCountryCodeSchema,
  taxId: z.string().trim().max(64).nullable(),
  statutoryIds: z
    .record(z.string().trim().min(1).max(32), z.string().trim().min(1).max(64))
    .default({}),
  classification: hrMcpEmployeeClassificationSnapshotSchema.nullable(),
  requiredStatutoryIdKeys: z.array(z.string().trim().min(1).max(32)).default([]),
});

export type HrMcpStatutoryReadinessInput = z.infer<
  typeof hrMcpStatutoryReadinessInputSchema
>;

export const hrMcpStatutoryReadinessCheckResultSchema = z.object({
  code: z.enum(HR_MCP_STATUTORY_READINESS_CHECK_CODES),
  passed: z.boolean(),
  message: z.string(),
});

export type HrMcpStatutoryReadinessCheckResult = z.infer<
  typeof hrMcpStatutoryReadinessCheckResultSchema
>;

export const hrMcpStatutoryReadinessResultSchema = z.object({
  employeeId: hrMcpEntityIdSchema,
  countryCode: hrMcpCountryCodeSchema,
  ready: z.boolean(),
  checks: z.array(hrMcpStatutoryReadinessCheckResultSchema),
  blockingCodes: z.array(z.enum(HR_MCP_STATUTORY_READINESS_CHECK_CODES)),
});

export type HrMcpStatutoryReadinessResult = z.infer<
  typeof hrMcpStatutoryReadinessResultSchema
>;

/** MCP-016 — threshold rule references supplied by country config. */
export const hrMcpThresholdRuleSnapshotSchema = z.object({
  minimumWage: hrMcpMoneyAmountSchema.nullable(),
  statutoryCeiling: hrMcpMoneyAmountSchema.nullable(),
  contributionThreshold: hrMcpMoneyAmountSchema.nullable(),
  taxThreshold: hrMcpMoneyAmountSchema.nullable(),
});

export type HrMcpThresholdRuleSnapshot = z.infer<
  typeof hrMcpThresholdRuleSnapshotSchema
>;

export const hrMcpThresholdValidationInputSchema = z.object({
  employeeId: hrMcpEntityIdSchema,
  countryCode: hrMcpCountryCodeSchema,
  currencyCode: z.string().trim().length(3),
  grossPay: hrMcpMoneyAmountSchema,
  contributablePay: hrMcpMoneyAmountSchema,
  taxablePay: hrMcpMoneyAmountSchema,
  rules: hrMcpThresholdRuleSnapshotSchema,
});

export type HrMcpThresholdValidationInput = z.infer<
  typeof hrMcpThresholdValidationInputSchema
>;

export const hrMcpThresholdViolationSchema = z.object({
  code: z.enum(HR_MCP_THRESHOLD_VIOLATION_CODES),
  message: z.string(),
  actualValue: hrMcpMoneyAmountSchema,
  limitValue: hrMcpMoneyAmountSchema,
});

export type HrMcpThresholdViolation = z.infer<
  typeof hrMcpThresholdViolationSchema
>;

export const hrMcpThresholdValidationResultSchema = z.object({
  employeeId: hrMcpEntityIdSchema,
  countryCode: hrMcpCountryCodeSchema,
  valid: z.boolean(),
  violations: z.array(hrMcpThresholdViolationSchema),
});

export type HrMcpThresholdValidationResult = z.infer<
  typeof hrMcpThresholdValidationResultSchema
>;
