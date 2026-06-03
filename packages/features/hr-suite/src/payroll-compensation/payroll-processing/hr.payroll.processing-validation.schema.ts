import { z } from "zod";

import {
  HR_PAYROLL_VALIDATION_CODES,
  HR_PAYROLL_VALIDATION_SEVERITIES,
} from "./hr.payroll.processing-constants.shared";

export const hrPayrollValidationIssueSchema = z.object({
  code: z.enum(HR_PAYROLL_VALIDATION_CODES),
  severity: z.enum(HR_PAYROLL_VALIDATION_SEVERITIES),
  employeeId: z.string().optional(),
  employeeLabel: z.string().optional(),
  message: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type HrPayrollValidationIssue = z.infer<
  typeof hrPayrollValidationIssueSchema
>;

export const hrPayrollValidationResultSchema = z.object({
  payrollRunId: z.string(),
  organizationId: z.string(),
  validatedAt: z.coerce.date(),
  readyForCalculation: z.boolean(),
  canFinalize: z.boolean(),
  blockingCount: z.number().int().nonnegative(),
  warningCount: z.number().int().nonnegative(),
  issues: z.array(hrPayrollValidationIssueSchema),
});

export type HrPayrollValidationResult = z.infer<
  typeof hrPayrollValidationResultSchema
>;

export const runHrPayrollValidationFormSchema = z.object({
  payrollRunId: z.string().trim().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  varianceThresholdPercent: z.coerce
    .number()
    .min(1)
    .max(100)
    .optional(),
});

export type RunHrPayrollValidationInput = z.infer<
  typeof runHrPayrollValidationFormSchema
>;
