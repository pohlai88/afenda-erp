"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type {
  HrmPerformanceReviewListRow,
  HrmPerformanceReviewerChoiceRow,
  HrmReviewCycleRow,
} from "../data/performance.queries.server"
import { PerformanceCycleRowActions } from "./performance-cycle-row-actions.client"
import { PerformanceReviewRowActions } from "./performance-review-row-actions.client"

type PerformanceReviewsTrailingContext = {
  orgSlug: string
  viewerUserId: string
  canUpdate: boolean
  reviews: readonly HrmPerformanceReviewListRow[]
}

export function PerformanceReviewsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as PerformanceReviewsTrailingContext | undefined
  const review = ctx?.reviews.find((entry) => entry.reviewId === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !review ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <PerformanceReviewRowActions
      orgSlug={ctx.orgSlug}
      review={review}
      viewerUserId={ctx.viewerUserId}
      canUpdate={ctx.canUpdate}
    />
  )
}

type PerformanceCyclesTrailingContext = {
  orgSlug: string
  canUpdate: boolean
  cycles: readonly HrmReviewCycleRow[]
  reviewerChoices: readonly HrmPerformanceReviewerChoiceRow[]
}

export function PerformanceCyclesTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as PerformanceCyclesTrailingContext | undefined
  const cycle = ctx?.cycles.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !cycle ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <PerformanceCycleRowActions
        orgSlug={ctx.orgSlug}
        cycle={cycle}
        canUpdate={ctx.canUpdate}
        reviewerChoices={ctx.reviewerChoices}
      />
    </GovernedTrailingActionSlot>
  )
}
