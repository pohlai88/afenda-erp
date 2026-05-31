import { z } from "zod";

import {
  HR_PAYROLL_ADJUSTMENT_KINDS,
  HR_PAYROLL_PRORATION_REASONS,
} from "./hr.payroll.processing-constants.shared";

const moneyAmountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,4})?$/, "Amount must be a positive decimal string");

export const hrPayrollAdjustmentBaseSchema = z.object({
  payrollRunId: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  kind: z.enum(HR_PAYROLL_ADJUSTMENT_KINDS),
  earningsCode: z.string().trim().min(1).max(64),
  amount: moneyAmountSchema,
  currencyCode: z.string().trim().length(3),
  effectiveDate: z.coerce.date(),
  reason: z.string().trim().min(3).max(2000),
  approvalReference: z.string().trim().min(1).max(128).optional(),
  retroactivePeriodStart: z.coerce.date().optional(),
  retroactivePeriodEnd: z.coerce.date().optional(),
  prorationReason: z.enum(HR_PAYROLL_PRORATION_REASONS).optional(),
});

export type HrPayrollAdjustmentInput = z.infer<
  typeof hrPayrollAdjustmentBaseSchema
>;

export const createHrPayrollAdjustmentFormSchema = hrPayrollAdjustmentBaseSchema;

export type HrPayrollAdjustmentRecord = HrPayrollAdjustmentInput & {
  id: string;
  organizationId: string;
  status: "draft" | "pending_approval" | "approved" | "applied";
  createdAt: Date;
  createdByUserId: string;
  appliedAt: Date | null;
};
