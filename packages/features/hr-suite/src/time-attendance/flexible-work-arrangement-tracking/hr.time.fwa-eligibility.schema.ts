import { z } from "zod";

import { hrFwaArrangementKindSchema } from "./hr.time.fwa-arrangement-types.schema";

export const hrFwaEligibilityResultSchema = z.object({
  eligible: z.boolean(),
  requiresExceptionApproval: z.boolean(),
  matchedRuleId: z.string().nullable(),
  reason: z.string(),
});

export type HrFwaEligibilityResultInput = z.infer<
  typeof hrFwaEligibilityResultSchema
>;

export const evaluateHrFwaEligibilityFormSchema = z.object({
  employeeId: z.string().trim().min(1),
  arrangementKind: hrFwaArrangementKindSchema,
  policyGroupCode: z.string().trim().optional(),
  asOf: z.coerce.date().optional(),
});

export type EvaluateHrFwaEligibilityFormInput = z.infer<
  typeof evaluateHrFwaEligibilityFormSchema
>;

export function parseEvaluateHrFwaEligibilityForm(formData: FormData) {
  return evaluateHrFwaEligibilityFormSchema.safeParse({
    employeeId: formData.get("employeeId"),
    arrangementKind: formData.get("arrangementKind"),
    policyGroupCode: formData.get("policyGroupCode") ?? undefined,
    asOf: formData.get("asOf") ?? undefined,
  });
}
