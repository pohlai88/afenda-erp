"use client"

import { Button } from "@afenda/ui/button"
import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { submitArchiveDependent } from "../actions/dependent.actions"

type EmployeeDetailDependentsTrailingContext = {
  orgSlug: string
  archiveLabel: string
}

export function EmployeeDetailDependentsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as EmployeeDetailDependentsTrailingContext | undefined
  const trailingAction = row.trailingAction
  if (!ctx || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <form action={submitArchiveDependent}>
        <input type="hidden" name="orgSlug" value={ctx.orgSlug} />
        <input type="hidden" name="dependentId" value={row.id} />
        <Button type="submit" variant="outline" size="sm">
          {ctx.archiveLabel}
        </Button>
      </form>
    </GovernedTrailingActionSlot>
  )
}
