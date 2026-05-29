"use client"

import { Button } from "@afenda/ui/button"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { submitRemoveKpiGoalMilestoneAction } from "../actions/kpi-goal.actions"
import type { ContractMutationFormState } from "@afenda/feature-hrm-core/shared"

function asVoidKpiGoalAction(
  fn: (formData: FormData) => Promise<ContractMutationFormState>
): (formData: FormData) => Promise<void> {
  return async (formData) => {
    await fn(formData)
  }
}

type KpiGoalMilestonesTrailingContext = {
  orgSlug: string
  removeLabel: string
}

export function KpiGoalMilestonesTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as KpiGoalMilestonesTrailingContext | undefined
  if (!ctx) {
    return null
  }
  return (
    <form action={asVoidKpiGoalAction(submitRemoveKpiGoalMilestoneAction)}>
      <input type="hidden" name="orgSlug" value={ctx.orgSlug} />
      <input type="hidden" name="milestoneId" value={row.id} />
      <Button type="submit" variant="ghost" size="sm">
        {ctx.removeLabel}
      </Button>
    </form>
  )
}
