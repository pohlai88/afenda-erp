"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { CareerPathStageDeleteForm } from "./career-pathing-forms.client"

type CareerPathFrameworkStagesTrailingContext = {
  organizationId: string
  orgSlug: string
  deleteLabel: string
}

export function CareerPathFrameworkStagesTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as CareerPathFrameworkStagesTrailingContext | undefined
  const trailingAction = row.trailingAction
  if (!ctx || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <CareerPathStageDeleteForm
        organizationId={ctx.organizationId}
        orgSlug={ctx.orgSlug}
        stageId={row.id}
        label={ctx.deleteLabel}
      />
    </GovernedTrailingActionSlot>
  )
}
