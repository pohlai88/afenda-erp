import { z } from "zod";

export const hrCareerPathDevelopmentMilestoneCreateSchema = z.object({
  goalId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(160),
  targetDate: z.coerce.date(),
  ownerEmployeeId: z.string().trim().min(1).optional(),
  ownerUserId: z.string().trim().min(1).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  completionCriteria: z.string().trim().max(2000).optional(),
  description: z.string().trim().max(4000).optional(),
});

export type HrCareerPathDevelopmentMilestoneCreateInput = z.infer<
  typeof hrCareerPathDevelopmentMilestoneCreateSchema
>;
