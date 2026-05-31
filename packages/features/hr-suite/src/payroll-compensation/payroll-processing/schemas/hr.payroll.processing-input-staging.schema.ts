import { z } from "zod";

import {
  HR_PAYROLL_INPUT_SOURCES,
  HR_PAYROLL_INPUT_STAGING_STATUSES,
} from "./hr.payroll.processing-constants.shared";

export const hrPayrollInputStagingRowSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  payrollRunId: z.string(),
  source: z.enum(HR_PAYROLL_INPUT_SOURCES),
  externalReference: z.string(),
  employeeId: z.string(),
  employeeLabel: z.string().optional(),
  amount: z.string().optional(),
  currencyCode: z.string().length(3).optional(),
  earningsOrDeductionCode: z.string().optional(),
  effectiveDate: z.coerce.date().optional(),
  status: z.enum(HR_PAYROLL_INPUT_STAGING_STATUSES),
  importedAt: z.coerce.date().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type HrPayrollInputStagingRow = z.infer<
  typeof hrPayrollInputStagingRowSchema
>;

export const importHrPayrollInputsFormSchema = z.object({
  payrollRunId: z.string().trim().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  sources: z
    .array(z.enum(HR_PAYROLL_INPUT_SOURCES))
    .min(1)
    .default([...HR_PAYROLL_INPUT_SOURCES]),
});

export type ImportHrPayrollInputsInput = z.infer<
  typeof importHrPayrollInputsFormSchema
>;
