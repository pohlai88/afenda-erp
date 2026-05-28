import { z } from "zod"

export const generateEngagementAnalyticsFormSchema = z.object({
  surveyId: z.string().uuid(),
  externalReference: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" || v === undefined ? null : v)),
})

export const tagEngagementOpenTextFormSchema = z.object({
  surveyId: z.string().uuid(),
  reviewId: z.string().uuid(),
  tags: z
    .string()
    .max(500)
    .transform((raw) =>
      raw
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    ),
})
