import { z } from "zod";

export const HR_EXPENSE_RECEIPT_KINDS = [
  "receipt",
  "invoice",
  "proof_of_payment",
] as const;

export type HrExpenseReceiptKind = (typeof HR_EXPENSE_RECEIPT_KINDS)[number];

/** HRM-EXP-003 — attach receipt after blob client upload completes. */
export const attachHrExpenseClaimReceiptFormSchema = z.object({
  claimId: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  kind: z.enum(HR_EXPENSE_RECEIPT_KINDS).default("receipt"),
  title: z.string().trim().min(1).max(200),
  blobUrl: z.string().url(),
  pathname: z.string().trim().min(1).max(500),
  contentType: z.string().trim().min(1).max(200),
  sizeBytes: z.coerce.number().int().positive(),
  blobEtag: z.string().trim().max(200).optional(),
  lineItemId: z.string().trim().max(100).optional(),
  receiptDate: z.string().trim().date().optional(),
  merchantName: z.string().trim().max(200).optional(),
  amountCents: z.coerce.number().int().nonnegative().optional(),
  currencyCode: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .optional(),
  externalReference: z.string().trim().max(200).optional(),
});

export type AttachHrExpenseClaimReceiptInput = z.infer<
  typeof attachHrExpenseClaimReceiptFormSchema
>;
