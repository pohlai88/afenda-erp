import { z } from "zod"

export const saveEngagementResponseDraftFormSchema = z.object({
  invitationId: z.string().uuid(),
})

export const submitEngagementResponseFormSchema = z.object({
  invitationId: z.string().uuid(),
})
