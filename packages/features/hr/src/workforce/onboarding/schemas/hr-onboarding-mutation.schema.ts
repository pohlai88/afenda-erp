import { z } from "zod";

export const hrStartOnboardingActionSchema = z.object({
  employeeId: z.string().trim().min(1),
  targetStatus: z.enum(["active", "probation", "confirmed"]).optional(),
  reason: z.string().trim().max(2000).optional(),
});

export const hrCompleteOnboardingActionSchema = z.object({
  caseId: z.string().trim().min(1),
});

export const hrCompleteOnboardingChecklistItemActionSchema = z.object({
  itemId: z.string().trim().min(1),
});
