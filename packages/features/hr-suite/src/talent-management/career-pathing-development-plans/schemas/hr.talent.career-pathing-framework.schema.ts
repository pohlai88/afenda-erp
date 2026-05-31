import { z } from "zod";

import {
  HR_CAREER_PATH_FRAMEWORK_STATUSES,
  HR_CAREER_PATH_KINDS,
} from "./hr.talent.career-pathing-constants.shared";

export const hrCareerPathFrameworkUpsertSchema = z.object({
  frameworkId: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(160),
  pathKind: z.enum(HR_CAREER_PATH_KINDS),
  description: z.string().trim().max(2000).optional(),
});

export const hrCareerPathFrameworkStatusSchema = z.object({
  frameworkId: z.string().trim().min(1),
  frameworkStatus: z.enum(HR_CAREER_PATH_FRAMEWORK_STATUSES),
});

export type HrCareerPathFrameworkUpsertInput = z.infer<
  typeof hrCareerPathFrameworkUpsertSchema
>;
