import { z } from "zod";

import { hrCsfGapPrioritySchema } from "./hr.talent.csf-gap.schema";

export const hrCsfDevelopmentActionTypeSchema = z.enum([
  "training",
  "coaching",
  "mentoring",
  "certification",
  "stretch_assignment",
  "self_study",
  "peer_learning",
]);

export const hrCsfDevelopmentLinkTypeSchema = z.enum([
  "course",
  "learning_path",
  "certification",
  "coaching",
  "development_plan",
]);

export const hrCsfLinkDevelopmentResourceSchema = z.object({
  recommendationId: z.string().trim().min(1),
  linkType: hrCsfDevelopmentLinkTypeSchema,
  externalRef: z.string().trim().min(1),
  title: z.string().trim().min(1).optional(),
  url: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const hrCsfListDevelopmentForGapSchema = z.object({
  gapId: z.string().trim().min(1),
});

export type HrCsfLinkDevelopmentResourceInput = z.infer<
  typeof hrCsfLinkDevelopmentResourceSchema
>;

export { hrCsfGapPrioritySchema };
