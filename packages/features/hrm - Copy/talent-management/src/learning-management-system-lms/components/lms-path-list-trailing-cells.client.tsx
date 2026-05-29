"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { LmsLearningPathArchiveButton } from "./lms-learning-path-archive-button.client"

type LmsPathsTrailingContext = {
  organizationId: string
  orgSlug: string
  archiveAction: (formData: FormData) => void | Promise<void>
  archiveLabel: string
  paths: readonly { id: string; state: string }[]
}

export function LmsPathsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as LmsPathsTrailingContext | undefined
  const path = ctx?.paths.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !path ||
    path.state !== "active" ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <LmsLearningPathArchiveButton
        organizationId={ctx.organizationId}
        orgSlug={ctx.orgSlug}
        learningPathId={path.id}
        archiveAction={ctx.archiveAction}
        label={ctx.archiveLabel}
      />
    </GovernedTrailingActionSlot>
  )
}
