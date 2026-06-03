import { z } from "zod";

export const hrFwaDecisionSchema = z.enum([
  "approve",
  "reject",
  "return",
  "exception_approve",
]);

export const decideHrFwaRequestFormSchema = z
  .object({
    requestId: z.string().min(1),
    decision: hrFwaDecisionSchema,
    rejectionReason: z.string().optional(),
    decisionNote: z.string().optional(),
    returnedNote: z.string().optional(),
    exceptionReason: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "reject" && !value.rejectionReason?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Rejection reason is required.",
        path: ["rejectionReason"],
      });
    }
    if (
      value.decision === "exception_approve" &&
      !value.exceptionReason?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Exception approval reason is required.",
        path: ["exceptionReason"],
      });
    }
  });

export const suspendHrFwaArrangementFormSchema = z.object({
  arrangementId: z.string().min(1),
  suspensionReason: z.string().trim().min(1, "Suspension reason is required."),
});

export const terminateHrFwaArrangementFormSchema = z.object({
  arrangementId: z.string().min(1),
  terminationReason: z
    .string()
    .trim()
    .min(1, "Termination reason is required."),
});

export const renewHrFwaArrangementFormSchema = z.object({
  arrangementId: z.string().min(1),
  newEffectiveTo: z.coerce.date(),
  renewalReason: z.string().optional(),
});

export const cancelHrFwaRequestFormSchema = z.object({
  requestId: z.string().min(1),
});
