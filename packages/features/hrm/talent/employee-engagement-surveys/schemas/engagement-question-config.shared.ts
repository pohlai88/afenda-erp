import { z } from "zod"

export const engagementQuestionConfigSchema = z.object({
  choices: z.array(z.string().trim().min(1).max(200)).min(2).max(20).optional(),
})

export type EngagementQuestionConfig = z.infer<
  typeof engagementQuestionConfigSchema
>

export function parseEngagementQuestionConfig(
  raw: unknown
): EngagementQuestionConfig | null {
  const parsed = engagementQuestionConfigSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

export function parseEngagementQuestionChoicesFromFormData(
  formData: FormData
): string[] | null {
  const raw = formData.get("choices")
  if (typeof raw !== "string") return null
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2) return null
  return lines
}

export function buildEngagementQuestionConfigFromFormData(
  formData: FormData,
  questionType: string
): EngagementQuestionConfig | null {
  if (questionType !== "single_choice" && questionType !== "multi_choice") {
    return null
  }
  const choices = parseEngagementQuestionChoicesFromFormData(formData)
  if (!choices) return null
  return { choices }
}
