import { z } from "zod";

import {
  HR_EXPENSE_CLAIM_CATEGORIES,
  HR_EXPENSE_CLAIM_STATUSES,
} from "./hr.payroll.expense-constants.shared";
import { hrExpenseLineItemSchema } from "./hr.payroll.expense-line-item.schema";

const currencyCodeSchema = z
  .string()
  .trim()
  .length(3)
  .transform((value) => value.toUpperCase());

const positiveAmountSchema = z.coerce.number().finite().positive();

/** HRM-EXP-005 — claim header captured on submit. */
export const hrExpenseClaimHeaderSchema = z.object({
  expenseDate: z.string().trim().date(),
  category: z.enum(HR_EXPENSE_CLAIM_CATEGORIES),
  amount: positiveAmountSchema,
  currencyCode: currencyCodeSchema,
  description: z.string().trim().min(1).max(2000),
  receiptReference: z.string().trim().max(500).optional(),
  receiptMandatory: z.coerce.boolean().optional(),
});

export const hrExpenseSubmitClaimSchema = hrExpenseClaimHeaderSchema.extend({
  employeeDisplayName: z.string().trim().min(1).max(200).optional(),
  employeeNumber: z.string().trim().max(50).optional(),
  lineItemsJson: z.string().trim().optional(),
});

export const hrExpenseReviewClaimSchema = z.object({
  claimId: z.string().trim().min(1).max(100),
  rejectionReason: z.string().trim().min(1).max(2000).optional(),
  returnReason: z.string().trim().min(1).max(2000).optional(),
  clarificationNote: z.string().trim().min(1).max(2000).optional(),
});

export const hrExpenseClaimRecordSchema = hrExpenseClaimHeaderSchema.extend({
  id: z.string().trim().min(1),
  organizationId: z.string().trim().min(1),
  claimReference: z.string().trim().min(1).max(40),
  status: z.enum(HR_EXPENSE_CLAIM_STATUSES),
  employeeId: z.string().trim().min(1),
  employeeDisplayName: z.string().trim().min(1),
  employeeNumber: z.string().trim().min(1),
  submittedAt: z.string().datetime().nullable(),
  reimbursableAmount: z.number().nonnegative(),
  approvedAmount: z.number().nonnegative(),
  rejectedAmount: z.number().nonnegative(),
  duplicateFlag: z.boolean(),
  exceptionRequired: z.boolean(),
  lineItems: z.array(hrExpenseLineItemSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type HrExpenseClaimRecord = z.infer<typeof hrExpenseClaimRecordSchema>;
