import { z } from "zod";

export const lynxRunFeedbackRatingSchema = z.enum(["positive", "negative"]);
export type LynxRunFeedbackRating = z.infer<typeof lynxRunFeedbackRatingSchema>;

export const lynxRunFeedbackCategorySchema = z.enum([
  "accurate",
  "unsupported",
  "wrong-tool",
  "slow",
  "unsafe",
  "other",
]);
export type LynxRunFeedbackCategory = z.infer<
  typeof lynxRunFeedbackCategorySchema
>;

export const lynxRunContextDataSchema = z
  .object({
    runId: z.string().trim().min(1),
    route: z.string().trim().min(1),
    workflowId: z.string().trim().min(1).optional(),
    workflowSessionId: z.string().trim().min(1).optional(),
  })
  .strict();
export type LynxRunContextData = z.infer<typeof lynxRunContextDataSchema>;

export const lynxRunContextMetadataSchema = z
  .object({
    lynxRun: lynxRunContextDataSchema,
  })
  .strict();
export type LynxRunContextMetadata = z.infer<
  typeof lynxRunContextMetadataSchema
>;

export const lynxLiveRunFeedbackRequestSchema = z
  .object({
    runId: z.string().trim().min(1),
    messageId: z.string().trim().min(1).max(240).optional(),
    rating: lynxRunFeedbackRatingSchema,
    category: lynxRunFeedbackCategorySchema,
    note: z.string().trim().max(1000).optional(),
  })
  .strict();
export type LynxLiveRunFeedbackRequest = z.infer<
  typeof lynxLiveRunFeedbackRequestSchema
>;
