import { z } from "zod"

import {
  hrmEngagementAnonymityModeSchema,
  hrmEngagementCategorySchema,
  hrmEngagementQuestionTypeSchema,
  hrmEngagementSurveyStateSchema,
  hrmEngagementSurveyTypeSchema,
  hrmEngagementTemplateStateSchema,
} from "./engagement-workflow.shared"

export const engagementSurveyTemplateRowSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  state: hrmEngagementTemplateStateSchema,
})

export const engagementSurveyRowSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  templateId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(200),
  surveyType: hrmEngagementSurveyTypeSchema,
  state: hrmEngagementSurveyStateSchema,
  anonymityMode: hrmEngagementAnonymityModeSchema,
  minSegmentResponses: z.number().int().min(1).nullable().optional(),
})

export const engagementSurveyQuestionRowSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  surveyId: z.string().uuid().nullable().optional(),
  templateId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().min(0),
  questionType: hrmEngagementQuestionTypeSchema,
  category: hrmEngagementCategorySchema,
  prompt: z.string().min(1).max(2000),
})
