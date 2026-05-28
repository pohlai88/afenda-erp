import { z } from "zod"

const gpgStepRulePolicySchema = z.object({
  minManagerRating: z.coerce.number().finite().min(0).max(10).optional(),
})

export type GpgStepRulePolicy = z.infer<typeof gpgStepRulePolicySchema>

export function parseGpgStepRulePolicy(policyJson: unknown): GpgStepRulePolicy {
  if (!policyJson || typeof policyJson !== "object") return {}
  const parsed = gpgStepRulePolicySchema.safeParse(policyJson)
  return parsed.success ? parsed.data : {}
}

export function buildGpgStepRulePolicyJson(input: {
  minManagerRating?: number | null
}): Record<string, unknown> | null {
  if (input.minManagerRating == null || Number.isNaN(input.minManagerRating)) {
    return null
  }
  return { minManagerRating: input.minManagerRating }
}

/** Parses numeric manager ratings (e.g. "4", "3.5") for step-increase gates. */
export function parseGpgManagerRatingValue(
  rating: string | null | undefined
): number | null {
  if (!rating) return null
  const trimmed = rating.trim()
  if (!trimmed) return null
  const numeric = Number(trimmed)
  return Number.isFinite(numeric) ? numeric : null
}

export function meetsGpgMinManagerRating(input: {
  managerRating: string | null | undefined
  minManagerRating: number | undefined
}): boolean {
  if (input.minManagerRating == null) return true
  const value = parseGpgManagerRatingValue(input.managerRating)
  if (value == null) return false
  return value >= input.minManagerRating
}
