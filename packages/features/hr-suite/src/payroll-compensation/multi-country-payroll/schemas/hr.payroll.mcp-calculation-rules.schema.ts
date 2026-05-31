import { z } from "zod";

import {
  HR_MCP_LEAVE_PAYROLL_IMPACTS,
  HR_MCP_PRORATION_BASES,
  HR_MCP_PRORATION_SCENARIOS,
} from "./hr.payroll.mcp-constants.shared";
import {
  hrMcpEntityIdSchema,
  hrMcpFormDateInput,
  hrMcpFormDateTimeInput,
  hrMcpMoneyAmountSchema,
  hrMcpOptionalNumericString,
  hrMcpRequiredNumericString,
  hrMcpRuleConfigSchema,
} from "./hr.payroll.mcp-form-fields.shared";

/** MCP-011 — country-specific proration rules. */
export const hrMcpUpsertProrationRuleSchema = z.object({
  countryConfigId: hrMcpEntityIdSchema,
  ruleVersionId: hrMcpEntityIdSchema.nullable().optional(),
  scenario: z.enum(HR_MCP_PRORATION_SCENARIOS),
  basis: z.enum(HR_MCP_PRORATION_BASES),
  ruleConfig: hrMcpRuleConfigSchema,
  effectiveFrom: hrMcpFormDateTimeInput,
  effectiveTo: hrMcpFormDateTimeInput.nullable().optional(),
  active: z.coerce.boolean().default(true),
});

export type HrMcpUpsertProrationRuleInput = z.infer<
  typeof hrMcpUpsertProrationRuleSchema
>;

export const hrMcpProrationCalculationInputSchema = z.object({
  scenario: z.enum(HR_MCP_PRORATION_SCENARIOS),
  basis: z.enum(HR_MCP_PRORATION_BASES),
  periodStart: hrMcpFormDateInput,
  periodEnd: hrMcpFormDateInput,
  eventStart: hrMcpFormDateInput.nullable().optional(),
  eventEnd: hrMcpFormDateInput.nullable().optional(),
  fullPeriodAmount: hrMcpMoneyAmountSchema,
  workingDaysInPeriod: z.number().int().nonnegative().nullable().optional(),
  workingDaysWorked: z.number().int().nonnegative().nullable().optional(),
});

export type HrMcpProrationCalculationInput = z.infer<
  typeof hrMcpProrationCalculationInputSchema
>;

export const hrMcpProrationCalculationResultSchema = z.object({
  proratedAmount: hrMcpMoneyAmountSchema,
  prorationFactor: z.number().finite().min(0).max(1),
  basis: z.enum(HR_MCP_PRORATION_BASES),
  scenario: z.enum(HR_MCP_PRORATION_SCENARIOS),
});

export type HrMcpProrationCalculationResult = z.infer<
  typeof hrMcpProrationCalculationResultSchema
>;

/** MCP-012 — overtime and rest-day calculation rules. */
export const hrMcpUpsertOvertimeRuleSchema = z.object({
  countryConfigId: hrMcpEntityIdSchema,
  ruleVersionId: hrMcpEntityIdSchema.nullable().optional(),
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(256),
  overtimeRateMultiplier: hrMcpRequiredNumericString,
  restDayRateMultiplier: hrMcpOptionalNumericString,
  publicHolidayRateMultiplier: hrMcpOptionalNumericString,
  maxWeeklyHours: hrMcpOptionalNumericString,
  ruleConfig: hrMcpRuleConfigSchema.nullable().optional(),
  effectiveFrom: hrMcpFormDateTimeInput,
  effectiveTo: hrMcpFormDateTimeInput.nullable().optional(),
  active: z.coerce.boolean().default(true),
});

export type HrMcpUpsertOvertimeRuleInput = z.infer<
  typeof hrMcpUpsertOvertimeRuleSchema
>;

export const hrMcpOvertimeCalculationInputSchema = z.object({
  baseHourlyRate: hrMcpMoneyAmountSchema,
  regularHours: hrMcpMoneyAmountSchema.default(0),
  overtimeHours: hrMcpMoneyAmountSchema.default(0),
  restDayHours: hrMcpMoneyAmountSchema.default(0),
  publicHolidayHours: hrMcpMoneyAmountSchema.default(0),
  overtimeRateMultiplier: hrMcpMoneyAmountSchema.positive().default(1.5),
  restDayRateMultiplier: hrMcpMoneyAmountSchema.positive().default(2),
  publicHolidayRateMultiplier: hrMcpMoneyAmountSchema.positive().default(2),
});

export type HrMcpOvertimeCalculationInput = z.infer<
  typeof hrMcpOvertimeCalculationInputSchema
>;

export const hrMcpOvertimeCalculationResultSchema = z.object({
  regularPay: hrMcpMoneyAmountSchema,
  overtimePay: hrMcpMoneyAmountSchema,
  restDayPay: hrMcpMoneyAmountSchema,
  publicHolidayPay: hrMcpMoneyAmountSchema,
  totalPay: hrMcpMoneyAmountSchema,
});

export type HrMcpOvertimeCalculationResult = z.infer<
  typeof hrMcpOvertimeCalculationResultSchema
>;

/** MCP-013 — leave payroll treatment by country. */
export const hrMcpUpsertLeavePayrollTreatmentSchema = z.object({
  countryConfigId: hrMcpEntityIdSchema,
  ruleVersionId: hrMcpEntityIdSchema.nullable().optional(),
  leaveTypeCode: z.string().trim().min(1).max(64),
  leaveTypeName: z.string().trim().max(256).nullable().optional(),
  payrollImpact: z.enum(HR_MCP_LEAVE_PAYROLL_IMPACTS),
  statutoryLeave: z.coerce.boolean().default(false),
  ruleConfig: hrMcpRuleConfigSchema.nullable().optional(),
  effectiveFrom: hrMcpFormDateTimeInput,
  effectiveTo: hrMcpFormDateTimeInput.nullable().optional(),
  active: z.coerce.boolean().default(true),
});

export type HrMcpUpsertLeavePayrollTreatmentInput = z.infer<
  typeof hrMcpUpsertLeavePayrollTreatmentSchema
>;

export const hrMcpLeavePayrollCalculationInputSchema = z.object({
  leaveTypeCode: z.string().trim().min(1).max(64),
  payrollImpact: z.enum(HR_MCP_LEAVE_PAYROLL_IMPACTS),
  leaveDays: hrMcpMoneyAmountSchema.nonnegative(),
  dailyRate: hrMcpMoneyAmountSchema.nonnegative(),
  statutoryDailyRate: hrMcpMoneyAmountSchema.nonnegative().nullable().optional(),
});

export type HrMcpLeavePayrollCalculationInput = z.infer<
  typeof hrMcpLeavePayrollCalculationInputSchema
>;

export const hrMcpLeavePayrollCalculationResultSchema = z.object({
  leaveTypeCode: z.string().trim().min(1).max(64),
  payrollImpact: z.enum(HR_MCP_LEAVE_PAYROLL_IMPACTS),
  paidAmount: hrMcpMoneyAmountSchema,
  unpaidAmount: hrMcpMoneyAmountSchema,
  leaveDays: hrMcpMoneyAmountSchema,
});

export type HrMcpLeavePayrollCalculationResult = z.infer<
  typeof hrMcpLeavePayrollCalculationResultSchema
>;

export const hrMcpUpsertProrationRuleFormSchema = hrMcpUpsertProrationRuleSchema;
export const hrMcpUpsertOvertimeRuleFormSchema = hrMcpUpsertOvertimeRuleSchema;
export const hrMcpUpsertLeavePayrollTreatmentFormSchema =
  hrMcpUpsertLeavePayrollTreatmentSchema;
