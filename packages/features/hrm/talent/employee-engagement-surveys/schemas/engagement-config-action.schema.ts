import { z } from "zod"

import { hrmEngagementAnonymityModeSchema } from "./engagement-workflow.shared"

const optionalDatetimeLocalSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => {
    if (!v || v.trim() === "") return null
    const parsed = new Date(v)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  })

export const saveEngagementSurveyConfigurationFormSchema = z.object({
  surveyId: z.string().uuid(),
  anonymityMode: hrmEngagementAnonymityModeSchema,
  minSegmentResponses: z
    .union([z.literal(""), z.coerce.number().int().min(1).max(100)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  allowDraftResponses: z
    .enum(["on", "off"])
    .optional()
    .transform((v) => v !== "off"),
  cycleId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" || v === undefined ? null : v)),
  cycleKey: z.string().trim().max(64).optional().or(z.literal("")),
  cycleLabel: z.string().trim().max(200).optional().or(z.literal("")),
  openAt: optionalDatetimeLocalSchema,
  closeAt: optionalDatetimeLocalSchema,
})

export const scheduleEngagementSurveyFormSchema =
  saveEngagementSurveyConfigurationFormSchema.extend({
    openAt: z
      .string()
      .min(1, "Open date is required.")
      .transform((v) => new Date(v))
      .refine((d) => !Number.isNaN(d.getTime()), "Invalid open date."),
    closeAt: z
      .string()
      .min(1, "Close date is required.")
      .transform((v) => new Date(v))
      .refine((d) => !Number.isNaN(d.getTime()), "Invalid close date."),
  })

export const revertEngagementSurveyToDraftFormSchema = z.object({
  surveyId: z.string().uuid(),
})
