/** Tenure bands for analytics segmentation (HRM-ENG-018 / AC 16). */
export function resolveEngagementTenureBand(input: {
  employmentStartDate: Date | null
  asOf?: Date
}): { key: string; label: string } {
  if (!input.employmentStartDate) {
    return { key: "unknown", label: "Unknown tenure" }
  }

  const asOf = input.asOf ?? new Date()
  const start = input.employmentStartDate
  const months =
    (asOf.getFullYear() - start.getFullYear()) * 12 +
    (asOf.getMonth() - start.getMonth())

  if (months < 6) {
    return { key: "under_6m", label: "< 6 months" }
  }
  if (months < 24) {
    return { key: "6_24m", label: "6–24 months" }
  }
  return { key: "24m_plus", label: "24+ months" }
}
