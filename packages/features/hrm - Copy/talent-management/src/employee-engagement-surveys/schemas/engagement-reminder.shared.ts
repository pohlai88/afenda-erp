import { z } from "zod"

export const engagementReminderScheduleSchema = z.object({
  enabled: z.boolean(),
  daysBeforeClose: z.array(z.number().int().min(0).max(90)),
})

export type EngagementReminderSchedule = z.infer<
  typeof engagementReminderScheduleSchema
>

export function parseEngagementReminderScheduleFromFormData(
  formData: FormData
): EngagementReminderSchedule {
  const enabled = formData.get("remindersEnabled") === "on"
  const daysRaw = formData.get("reminderDaysBeforeClose")
  const days =
    typeof daysRaw === "string" && daysRaw.trim().length > 0
      ? daysRaw
          .split(",")
          .map((part) => Number(part.trim()))
          .filter((n) => !Number.isNaN(n) && n >= 0)
      : []

  return engagementReminderScheduleSchema.parse({
    enabled,
    daysBeforeClose: days.length > 0 ? days : enabled ? [7, 1] : [],
  })
}
