function parseRate(value: string): number {
  const parsed = Number.parseFloat(value.trim())
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }
  return parsed
}

export type GpgLocalityAdjustmentInput = {
  readonly baseRate: string
  readonly localityPercent: string | null
  readonly supplementalPercent: string | null
  readonly supplementalAmount: string | null
}

/**
 * Pure locality-adjusted pay reference (HRM-GPG-011).
 * Applies locality rule percent then employee adjustment refs in order.
 */
export function computeGpgLocalityAdjustedPay(
  input: GpgLocalityAdjustmentInput
): { readonly baseRate: string; readonly adjustedRate: string } {
  let total = parseRate(input.baseRate)

  const localityPercent = input.localityPercent
    ? parseRate(input.localityPercent)
    : 0
  if (localityPercent > 0) {
    total += total * (localityPercent / 100)
  }

  const supplementalPercent = input.supplementalPercent
    ? parseRate(input.supplementalPercent)
    : 0
  if (supplementalPercent > 0) {
    total += total * (supplementalPercent / 100)
  }

  const supplementalAmount = input.supplementalAmount
    ? parseRate(input.supplementalAmount)
    : 0
  if (supplementalAmount > 0) {
    total += supplementalAmount
  }

  return {
    baseRate: input.baseRate,
    adjustedRate: total.toFixed(2),
  }
}
