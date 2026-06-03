import { z } from "zod";

const requiredReasonSchema = z
  .string()
  .trim()
  .min(1, "Reason is required.")
  .max(4000);

/** HRM-OTM-017/018 — approver decision payloads. */
export const otmApproveFormSchema = z.object({
  requestId: z.string().trim().min(1),
  decisionNote: z.string().trim().max(4000).optional(),
});

export const otmRejectFormSchema = z.object({
  requestId: z.string().trim().min(1),
  rejectionReason: requiredReasonSchema,
});

export const otmReturnFormSchema = z.object({
  requestId: z.string().trim().min(1),
  returnReason: requiredReasonSchema,
});

export const otmAdjustFormSchema = z.object({
  requestId: z.string().trim().min(1),
  adjustedHours: z.coerce.number().positive().max(24),
  adjustReason: requiredReasonSchema,
});

export const otmBulkApproveFormSchema = z.object({
  requestIds: z.array(z.string().trim().min(1)).min(1).max(25),
  decisionNote: z.string().trim().max(4000).optional(),
});

export const otmExceptionDecisionFormSchema = z.object({
  exceptionId: z.string().trim().min(1),
  decision: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(4000).optional(),
});

export type OtmApproveFormInput = z.infer<typeof otmApproveFormSchema>;
export type OtmRejectFormInput = z.infer<typeof otmRejectFormSchema>;
export type OtmReturnFormInput = z.infer<typeof otmReturnFormSchema>;
export type OtmAdjustFormInput = z.infer<typeof otmAdjustFormSchema>;
export type OtmBulkApproveFormInput = z.infer<typeof otmBulkApproveFormSchema>;
export type OtmExceptionDecisionFormInput = z.infer<
  typeof otmExceptionDecisionFormSchema
>;
