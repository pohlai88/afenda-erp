import { z } from "zod";

export const hrCareerPathDevelopmentPlanCreateSchema = z.object({
  employeeId: z.string().trim().min(1),
  code: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(160),
  targetRoleId: z.string().trim().min(1).optional(),
  description: z.string().trim().max(4000).optional(),
  startDate: z.coerce.date().optional(),
  targetCompletionDate: z.coerce.date().optional(),
});

export type HrCareerPathDevelopmentPlanCreateInput = z.infer<
  typeof hrCareerPathDevelopmentPlanCreateSchema
>;
