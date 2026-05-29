export function formatBudgetVariance(
  scheduledCost: string | null,
  approvedBudget: string | null
): string | null {
  if (!scheduledCost || !approvedBudget) return null
  const scheduled = Number.parseFloat(scheduledCost)
  const budget = Number.parseFloat(approvedBudget)
  if (Number.isNaN(scheduled) || Number.isNaN(budget)) return null
  return (scheduled - budget).toFixed(2)
}

/** True when scheduled cost exceeds approved budget (HRM-RWS-024 pre-publish gate). */
export function isScheduledLaborOverBudget(
  budgetVarianceAmount: string | null
): boolean {
  if (budgetVarianceAmount === null) return false
  const variance = Number.parseFloat(budgetVarianceAmount)
  return !Number.isNaN(variance) && variance > 0
}

export function sumScheduledMinutes(
  minutesByDate: readonly { scheduledMinutes: number }[]
): number {
  return minutesByDate.reduce((sum, row) => sum + row.scheduledMinutes, 0)
}
