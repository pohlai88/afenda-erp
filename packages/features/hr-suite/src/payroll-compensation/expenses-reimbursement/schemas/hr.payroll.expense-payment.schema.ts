import { z } from "zod";

import { HR_EXPENSE_PAYMENT_CHANNELS } from "./hr.payroll.expense-constants.shared";

/** HRM-EXP-022 — send approved claim to payroll or AP. */
export const hrExpenseSendToPayrollOrApSchema = z.object({
  claimId: z.string().trim().min(1),
  paymentChannel: z.enum(HR_EXPENSE_PAYMENT_CHANNELS),
});

export type HrExpenseSendToPayrollOrApInput = z.infer<
  typeof hrExpenseSendToPayrollOrApSchema
>;

/** HRM-EXP-023 — record payment reference after processing. */
export const hrExpenseRecordPaymentReferenceSchema = z.object({
  claimId: z.string().trim().min(1),
  paymentReference: z.string().trim().min(1).max(200),
  paidAt: z.coerce.date().optional(),
});

export type HrExpenseRecordPaymentReferenceInput = z.infer<
  typeof hrExpenseRecordPaymentReferenceSchema
>;
