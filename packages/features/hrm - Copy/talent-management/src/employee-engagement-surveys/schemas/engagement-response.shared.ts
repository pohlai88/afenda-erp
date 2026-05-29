import { z } from "zod"

import type { HrmEngagementQuestionType } from "./engagement-workflow.shared"

export const engagementAnswerValueSchema = z.union([
  z.string().max(4000),
  z.number(),
  z.boolean(),
  z.array(z.string().max(200)),
])

export type EngagementAnswerValue = z.infer<typeof engagementAnswerValueSchema>

export const engagementResponseAnswerInputSchema = z.object({
  questionId: z.string().uuid(),
  value: engagementAnswerValueSchema,
})

export type EngagementResponseAnswerInput = z.infer<
  typeof engagementResponseAnswerInputSchema
>

/** HRM-ENG-016 — percentage 0–100 from invitation counts. */
export function computeEngagementResponseRate(input: {
  invitedCount: number
  submittedCount: number
}): number {
  if (input.invitedCount <= 0) return 0
  return Math.min(
    100,
    Math.round((input.submittedCount / input.invitedCount) * 100)
  )
}

/** HRM-ENG-014 — one submitted response per invitation (DB unique index). */
export function engagementInvitationAcceptsResponse(input: {
  invitationState: string
  surveyState: string
}): boolean {
  return (
    input.surveyState === "published" && input.invitationState === "pending"
  )
}

export function isEngagementSurveyResponseWindowOpen(input: {
  state: string
  openAt: Date | null
  closeAt: Date | null
  now?: Date
}): boolean {
  if (input.state !== "published") return false
  const now = input.now ?? new Date()
  if (input.openAt && now.getTime() < input.openAt.getTime()) return false
  if (input.closeAt && now.getTime() > input.closeAt.getTime()) return false
  return true
}

export function parseEngagementAnswersFromFormData(
  formData: FormData,
  questionIds: readonly string[]
): EngagementResponseAnswerInput[] {
  const answers: EngagementResponseAnswerInput[] = []
  for (const questionId of questionIds) {
    const fieldName = `answer_${questionId}`
    const questionType = formData.get(`type_${questionId}`)
    const singleEntry = formData.get(fieldName)
    const rawEntries =
      questionType === "multi_choice"
        ? formData.getAll(fieldName)
        : singleEntry === null
          ? []
          : [singleEntry]

    const value = coerceAnswerValue(rawEntries, questionType)
    if (value === undefined) continue
    answers.push({ questionId, value })
  }
  return answers
}

function coerceAnswerValue(
  rawEntries: readonly FormDataEntryValue[],
  questionType: FormDataEntryValue | null
): EngagementAnswerValue | undefined {
  if (questionType === "multi_choice") {
    const values = rawEntries
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean)
    return values.length > 0 ? values : undefined
  }

  const raw = rawEntries[0]
  if (typeof raw !== "string") return undefined
  const trimmed = raw.trim()
  if (!trimmed) return undefined

  if (questionType === "rating") {
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : undefined
  }
  if (questionType === "yes_no") {
    if (trimmed === "yes" || trimmed === "true") return true
    if (trimmed === "no" || trimmed === "false") return false
    return undefined
  }
  if (questionType === "multi_choice") {
    return trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return trimmed
}

export function validateEngagementAnswerForQuestion(input: {
  questionType: HrmEngagementQuestionType
  value: EngagementAnswerValue
}): { ok: true } | { ok: false; message: string } {
  const { questionType, value } = input
  switch (questionType) {
    case "rating":
      if (typeof value !== "number" || value < 1 || value > 10) {
        return { ok: false, message: "Rating must be between 1 and 10." }
      }
      return { ok: true }
    case "yes_no":
      if (typeof value !== "boolean") {
        return { ok: false, message: "Select yes or no." }
      }
      return { ok: true }
    case "multi_choice":
      if (!Array.isArray(value) || value.length < 1) {
        return { ok: false, message: "Select at least one option." }
      }
      return { ok: true }
    case "single_choice":
    case "open_text":
    case "comment":
      if (typeof value !== "string" || !value.trim()) {
        return { ok: false, message: "Answer is required." }
      }
      return { ok: true }
    default:
      return { ok: false, message: "Unsupported question type." }
  }
}
