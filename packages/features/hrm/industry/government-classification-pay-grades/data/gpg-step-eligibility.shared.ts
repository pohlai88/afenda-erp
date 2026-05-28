const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function parseIsoDate(
  value: string
): { y: number; m: number; d: number } | null {
  if (!ISO_DATE.test(value)) return null
  const [y, m, d] = value.split("-").map(Number)
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null
  return { y, m, d }
}

function formatIsoDate(parts: { y: number; m: number; d: number }): string {
  const month = String(parts.m).padStart(2, "0")
  const day = String(parts.d).padStart(2, "0")
  return `${parts.y}-${month}-${day}`
}

/** Add calendar months; clamps day when target month is shorter (e.g. Jan 31 + 1 → Feb 28). */
export function addCalendarMonths(
  isoDate: string,
  months: number
): string | null {
  const parsed = parseIsoDate(isoDate)
  if (!parsed || months < 0) return null

  const totalMonths = parsed.m - 1 + months
  const targetYear = parsed.y + Math.floor(totalMonths / 12)
  const targetMonth = (totalMonths % 12) + 1
  const lastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate()
  const day = Math.min(parsed.d, lastDay)

  return formatIsoDate({ y: targetYear, m: targetMonth, d: day })
}

export type GpgStepEligibilityInput = {
  readonly assignmentEffectiveFrom: string
  readonly waitingPeriodMonths: number
  readonly asOfDate: string
}

/**
 * Next step-increase eligibility date from assignment effective date + rule waiting period (HRM-GPG-014).
 */
export function computeGpgNextEligibilityDate(
  assignmentEffectiveFrom: string,
  waitingPeriodMonths: number
): string | null {
  if (waitingPeriodMonths < 0) return null
  return addCalendarMonths(assignmentEffectiveFrom, waitingPeriodMonths)
}

export function isGpgStepEligibleAsOf(
  eligibilityDate: string,
  asOfDate: string
): boolean {
  const eligible = parseIsoDate(eligibilityDate)
  const asOf = parseIsoDate(asOfDate)
  if (!eligible || !asOf) return false
  if (eligible.y !== asOf.y) return eligible.y < asOf.y
  if (eligible.m !== asOf.m) return eligible.m < asOf.m
  return eligible.d <= asOf.d
}

export function countDaysUntilEligibility(
  eligibilityDate: string,
  asOfDate: string
): number | null {
  const eligible = parseIsoDate(eligibilityDate)
  const asOf = parseIsoDate(asOfDate)
  if (!eligible || !asOf) return null
  const start = Date.UTC(eligible.y, eligible.m - 1, eligible.d)
  const end = Date.UTC(asOf.y, asOf.m - 1, asOf.d)
  return Math.round((start - end) / 86_400_000)
}
