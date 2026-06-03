import { z } from "zod";

import {
  HR_PAYROLL_PAYMENT_STATUSES,
  HR_PAYROLL_RUN_STATUSES,
} from "./hr.payroll.processing-constants.shared";

export const payrollRunIdSchema = z.object({
  payrollRunId: z.string().min(1),
});

export const payrollPreviewSchema = payrollRunIdSchema;

export const payrollSubmitApprovalSchema = payrollRunIdSchema;

export const payrollApproveSchema = payrollRunIdSchema;

export const payrollLockSchema = payrollRunIdSchema;

export const payrollFinalizeSchema = payrollRunIdSchema;

export const payrollGeneratePayslipsSchema = payrollRunIdSchema;

export const payrollPaymentBatchSchema = payrollRunIdSchema;

export const payrollPaymentStatusSchema = z.object({
  paymentBatchId: z.string().min(1),
  paymentStatus: z.enum(HR_PAYROLL_PAYMENT_STATUSES),
  employeeId: z.string().optional(),
});

export const payrollJournalSchema = payrollRunIdSchema;

export const payrollCorrectionSchema = z.object({
  payrollRunId: z.string().min(1),
  correctionKind: z.enum(["correction", "reversal"]),
  reason: z.string().min(3).max(500),
});

export const payrollCreateRunSchema = z.object({
  payrollGroupId: z.string().min(1),
  runCode: z.string().min(1).max(32),
  paySchedule: z.enum([
    "monthly",
    "weekly",
    "bi_weekly",
    "semi_monthly",
    "ad_hoc",
  ]),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  cutoffDate: z.coerce.date(),
  payDate: z.coerce.date(),
});

export const payrollCalculateSchema = payrollRunIdSchema;

export type PayrollRunStatus = (typeof HR_PAYROLL_RUN_STATUSES)[number];
