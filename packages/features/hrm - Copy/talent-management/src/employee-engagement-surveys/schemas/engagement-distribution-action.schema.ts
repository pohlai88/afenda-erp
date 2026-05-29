import { z } from "zod"

export const publishEngagementSurveyFormSchema = z.object({
  surveyId: z.string().uuid(),
})

export const closeEngagementSurveyFormSchema = z.object({
  surveyId: z.string().uuid(),
})

export const resendEngagementInvitationFormSchema = z.object({
  invitationId: z.string().uuid(),
})
