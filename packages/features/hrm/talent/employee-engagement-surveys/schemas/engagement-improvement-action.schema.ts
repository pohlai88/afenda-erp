import { z } from "zod"

import {
  hrmEngagementImprovementActionStateSchema,
  hrmEngagementImprovementCategorySchema,
  hrmEngagementImprovementPrioritySchema,
} from "./engagement-improvement.shared"

const optionalUuid = z
  .string()
  .uuid()
  .optional()
  .or(z.literal("").transform(() => undefined))

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
  .optional()
  .or(z.literal("").transform(() => undefined))

export const createEngagementImprovementActionFormSchema = z.object({
  surveyId: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required.").max(200),
  ownerEmployeeId: optionalUuid,
  dueDate: optionalDate,
  priority: hrmEngagementImprovementPrioritySchema.optional(),
  category: hrmEngagementImprovementCategorySchema.optional(),
  questionId: optionalUuid,
})

export const updateEngagementImprovementActionFormSchema = z.object({
  actionId: z.string().uuid(),
  surveyId: z.string().uuid(),
  nextStatus: hrmEngagementImprovementActionStateSchema.optional(),
  ownerEmployeeId: optionalUuid,
  dueDate: optionalDate,
  priority: hrmEngagementImprovementPrioritySchema.optional(),
})

export const completeEngagementImprovementActionFormSchema = z.object({
  actionId: z.string().uuid(),
  surveyId: z.string().uuid(),
})
