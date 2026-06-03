import { z } from "zod";

const requiredReasonSchema = z
  .string()
  .trim()
  .min(1, "Reason is required.")
  .max(4000);

/** HRM-EXP-018/019 — approver decision payloads. */
export const expApproveClaimFormSchema = z.object({
  claimId: z.string().trim().min(1),
  decisionNote: z.string().trim().max(4000).optional(),
});

export const expRejectClaimFormSchema = z.object({
  claimId: z.string().trim().min(1),
  rejectionReason: requiredReasonSchema,
});

export const expReturnClaimFormSchema = z.object({
  claimId: z.string().trim().min(1),
  returnReason: requiredReasonSchema,
});

export const expClarificationClaimFormSchema = z.object({
  claimId: z.string().trim().min(1),
  clarificationReason: requiredReasonSchema,
});

export const expExceptionApprovalFormSchema = z.object({
  exceptionId: z.string().trim().min(1),
  decision: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(4000).optional(),
});

export type ExpApproveClaimFormInput = z.infer<typeof expApproveClaimFormSchema>;
export type ExpRejectClaimFormInput = z.infer<typeof expRejectClaimFormSchema>;
export type ExpReturnClaimFormInput = z.infer<typeof expReturnClaimFormSchema>;
export type ExpClarificationClaimFormInput = z.infer<
  typeof expClarificationClaimFormSchema
>;
export type ExpExceptionApprovalFormInput = z.infer<
  typeof expExceptionApprovalFormSchema
>;
