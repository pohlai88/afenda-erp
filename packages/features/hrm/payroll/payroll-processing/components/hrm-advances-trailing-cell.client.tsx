"use client"

import { Button } from "@afenda/ui/button"
import { Textarea } from "@afenda/ui/textarea"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { submitDecideSalaryAdvance } from "../actions/salary-advance.actions"

type HrmAdvancesTrailingContext = {
  orgSlug: string
  decisionNotePlaceholder: string
  approveLabel: string
  rejectLabel: string
  advances: readonly { id: string; state: string }[]
}

export function HrmAdvancesTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as HrmAdvancesTrailingContext | undefined
  const advance = ctx?.advances.find((entry) => entry.id === row.id)
  if (!ctx || !advance || advance.state !== "pending") {
    return null
  }
  return (
    <div className="flex min-w-[14rem] flex-col gap-2">
      <form action={submitDecideSalaryAdvance} className="flex flex-col gap-2">
        <input type="hidden" name="orgSlug" value={ctx.orgSlug} />
        <input type="hidden" name="advanceId" value={advance.id} />
        <input type="hidden" name="decision" value="approve" />
        <Textarea
          name="decisionNote"
          rows={2}
          placeholder={ctx.decisionNotePlaceholder}
          className="text-xs"
        />
        <Button type="submit" variant="secondary" size="sm" className="w-fit">
          {ctx.approveLabel}
        </Button>
      </form>
      <form action={submitDecideSalaryAdvance} className="flex flex-col gap-2">
        <input type="hidden" name="orgSlug" value={ctx.orgSlug} />
        <input type="hidden" name="advanceId" value={advance.id} />
        <input type="hidden" name="decision" value="reject" />
        <Textarea
          name="decisionNote"
          rows={2}
          placeholder={ctx.decisionNotePlaceholder}
          className="text-xs"
        />
        <Button type="submit" variant="outline" size="sm" className="w-fit">
          {ctx.rejectLabel}
        </Button>
      </form>
    </div>
  )
}
