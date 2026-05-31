import { z } from "zod";

import {
  HR_DEVELOPMENT_GOAL_STATUSES,
  HR_DEVELOPMENT_GOAL_TYPES,
} from "./hr.talent.career-pathing-constants.shared";

export const hrCareerPathDevelopmentGoalCreateSchema = z.object({
  planId: z.string().trim().min(1),
  goalType: z.enum(HR_DEVELOPMENT_GOAL_TYPES),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  targetCompletionDate: z.coerce.date().optional(),
  skillCode: z.string().trim().max(64).optional(),
  competencyCode: z.string().trim().max(64).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const hrCareerPathDevelopmentGoalStatusSchema = z.object({
  goalId: z.string().trim().min(1),
  goalStatus: z.enum(HR_DEVELOPMENT_GOAL_STATUSES),
  progressPercent: z.coerce.number().int().min(0).max(100).optional(),
  evidenceNotes: z.string().trim().max(4000).optional(),
});

export type HrCareerPathDevelopmentGoalCreateInput = z.infer<
  typeof hrCareerPathDevelopmentGoalCreateSchema
>;

export type HrCareerPathDevelopmentGoalStatusInput = z.infer<
  typeof hrCareerPathDevelopmentGoalStatusSchema
>;
