import { z } from "zod"

import {
  hrmEngagementCategorySchema,
  hrmEngagementQuestionTypeSchema,
  hrmEngagementSurveyTypeSchema,
} from "./engagement-workflow.shared"

const slugCodeSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(
    /^[a-z0-9][a-z0-9_-]*$/i,
    "Use letters, numbers, hyphens, or underscores."
  )

export const createEngagementTemplateFormSchema = z.object({
  code: slugCodeSchema,
  name: z.string().trim().min(1).max(200),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === "" ? null : (v ?? null))),
})

export const cloneEngagementTemplateFormSchema = z.object({
  sourceTemplateId: z.string().uuid(),
  code: slugCodeSchema,
  name: z.string().trim().min(1).max(200),
})

export const addEngagementTemplateQuestionFormSchema = z.object({
  templateId: z.string().uuid(),
  prompt: z.string().trim().min(1).max(2000),
  questionType: hrmEngagementQuestionTypeSchema,
  category: hrmEngagementCategorySchema,
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
  choices: z.string().trim().max(4000).optional().or(z.literal("")),
})

export const createEngagementSurveyDraftFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
  surveyType: hrmEngagementSurveyTypeSchema,
  templateId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
})

export const updateEngagementTemplateFormSchema = z.object({
  templateId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === "" ? null : (v ?? null))),
  state: z.enum(["draft", "active"]),
})

export const archiveEngagementTemplateFormSchema = z.object({
  templateId: z.string().uuid(),
})

export const updateEngagementSurveyDraftFormSchema = z.object({
  surveyId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  surveyType: hrmEngagementSurveyTypeSchema,
})

export const deleteEngagementSurveyDraftFormSchema = z.object({
  surveyId: z.string().uuid(),
})

/** Validates every supported question type and category enum (HRM-ENG-004/005). */
export function assertEngagementQuestionShape(input: {
  questionType: z.infer<typeof hrmEngagementQuestionTypeSchema>
  category: z.infer<typeof hrmEngagementCategorySchema>
}) {
  return {
    questionType: hrmEngagementQuestionTypeSchema.parse(input.questionType),
    category: hrmEngagementCategorySchema.parse(input.category),
  }
}
