"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import {
  FrameworkStatusUpdateForm,
  GoalStatusUpdateForm,
} from "./career-pathing-forms.client"

type CareerPathFrameworkTrailingContext = {
  organizationId: string
  orgSlug: string
  frameworks: readonly {
    id: string
    status: "draft" | "active" | "archived"
  }[]
  labels: {
    activate: string
    archive: string
    restoreDraft: string
  }
}

export function CareerPathFrameworkTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as CareerPathFrameworkTrailingContext | undefined
  const framework = ctx?.frameworks.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !framework ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <FrameworkStatusUpdateForm
        organizationId={ctx.organizationId}
        orgSlug={ctx.orgSlug}
        frameworkId={framework.id}
        currentStatus={framework.status}
        labels={ctx.labels}
      />
    </GovernedTrailingActionSlot>
  )
}

type CareerPathPlanGoalTrailingContext = {
  organizationId: string
  orgSlug: string
  markInProgressLabel: string
}

export function CareerPathPlanGoalTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as CareerPathPlanGoalTrailingContext | undefined
  const trailingAction = row.trailingAction
  if (!ctx || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <GoalStatusUpdateForm
        organizationId={ctx.organizationId}
        orgSlug={ctx.orgSlug}
        goalId={row.id}
        label={ctx.markInProgressLabel}
      />
    </GovernedTrailingActionSlot>
  )
}
