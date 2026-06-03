import { z } from "zod";

export const hrSftScheduleChangeDecisionSchema = z.enum([
  "approve",
  "reject",
  "return",
  "override",
]);

export type HrSftScheduleChangeDecision = z.infer<
  typeof hrSftScheduleChangeDecisionSchema
>;

export const hrSftScheduleChangePayloadSchema = z.object({
  assignmentId: z.string().trim().min(1).optional(),
  templateId: z.string().trim().min(1).optional(),
  shiftDate: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional(),
});

export const hrSftSubmitScheduleChangeSchema = z.object({
  requestingEmployeeId: z.string().trim().min(1).optional(),
  assignmentId: z.string().trim().min(1).optional(),
  proposedChanges: hrSftScheduleChangePayloadSchema,
  reason: z.string().trim().min(1, "Schedule change reason is required.").max(500),
});

export type HrSftSubmitScheduleChangeInput = z.infer<
  typeof hrSftSubmitScheduleChangeSchema
>;

/** HRM-SFT-023/024 — manager-initiated or employee schedule change decisions. */
export const hrSftDecideScheduleChangeSchema = z
  .object({
    scheduleChangeRequestId: z.string().trim().min(1),
    decision: hrSftScheduleChangeDecisionSchema,
    rejectionReason: z.string().optional(),
    overrideReason: z.string().optional(),
    returnedNote: z.string().optional(),
    decisionNote: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "reject" && !value.rejectionReason?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Rejection reason is required.",
        path: ["rejectionReason"],
      });
    }
    if (value.decision === "override" && !value.overrideReason?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Override reason is required.",
        path: ["overrideReason"],
      });
    }
    if (value.decision === "return" && !value.returnedNote?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Return note is required.",
        path: ["returnedNote"],
      });
    }
  });

export type HrSftDecideScheduleChangeInput = z.infer<
  typeof hrSftDecideScheduleChangeSchema
>;
