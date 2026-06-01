import { z } from "zod";

import { hrLifecycleEmploymentStatusSchema } from "./hr.workforce.lifecycle-employment-status.schema";

/** Stored transition queue status only — no derived posture tokens on write (compliance pattern). */
export const hrLifecycleTransitionStatusSchema = z.enum([
  "pending",
  "applied",
  "cancelled",
  "rejected",
  "failed",
]);

const LIFECYCLE_STATUSES_REQUIRING_REASON = new Set([
  "suspended",
  "notice_period",
  "offboarding",
  "separated",
  "retired",
  "terminated",
]);

const LIFECYCLE_STATUSES_REQUIRING_AUTHORIZATION = new Set([
  "suspended",
  "terminated",
]);

export const hrLifecycleScheduleStatusChangeSchema = z
  .object({
    employeeId: z.string().min(1),
    toStatus: hrLifecycleEmploymentStatusSchema,
    effectiveDate: z.coerce.date().optional(),
    reason: z.string().trim().max(2000).optional(),
    approvalReference: z.string().trim().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (
      LIFECYCLE_STATUSES_REQUIRING_REASON.has(value.toStatus) &&
      !value.reason?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Reason is required for this lifecycle transition.",
        path: ["reason"],
      });
    }
    if (LIFECYCLE_STATUSES_REQUIRING_AUTHORIZATION.has(value.toStatus)) {
      if (!value.effectiveDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Effective date is required for this lifecycle transition.",
          path: ["effectiveDate"],
        });
      }
      if (!value.approvalReference?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Approval reference is required for this lifecycle transition.",
          path: ["approvalReference"],
        });
      }
    }
  });

export type HrLifecycleScheduleStatusChangeInput = z.infer<
  typeof hrLifecycleScheduleStatusChangeSchema
>;

export const hrLifecycleCancelTransitionSchema = z.object({
  transitionId: z.string().min(1),
});

export type HrLifecycleCancelTransitionInput = z.infer<
  typeof hrLifecycleCancelTransitionSchema
>;

function readLifecycleFormField(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseHrLifecycleScheduleStatusChangeForm(
  formData: FormData,
) {
  const effectiveDateRaw = readLifecycleFormField(formData, "effectiveDate");
  return hrLifecycleScheduleStatusChangeSchema.safeParse({
    employeeId: readLifecycleFormField(formData, "employeeId"),
    toStatus: readLifecycleFormField(formData, "toStatus"),
    effectiveDate: effectiveDateRaw ? new Date(effectiveDateRaw) : undefined,
    reason: readLifecycleFormField(formData, "reason"),
    approvalReference: readLifecycleFormField(formData, "approvalReference"),
  });
}

export function parseHrLifecycleCancelTransitionForm(formData: FormData) {
  return hrLifecycleCancelTransitionSchema.safeParse({
    transitionId: readLifecycleFormField(formData, "transitionId"),
  });
}
