import { z } from "zod";

export const hrStartOffboardingActionSchema = z.object({
  employeeId: z.string().trim().min(1),
  lastWorkingDate: z.coerce.date().optional(),
  reason: z.string().trim().max(2000).optional(),
});

export const hrCompleteOffboardingActionSchema = z.object({
  caseId: z.string().trim().min(1),
});

export const hrCompleteOffboardingClearanceItemActionSchema = z.object({
  itemId: z.string().trim().min(1),
});
