"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { LmsCourseArchiveButton } from "./lms-course-archive-button.client"

type LmsCatalogTrailingContext = {
  organizationId: string
  orgSlug: string
  archiveAction: (formData: FormData) => void | Promise<void>
  archiveLabel: string
  courses: readonly { id: string; state: string }[]
}

export function LmsCatalogTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as LmsCatalogTrailingContext | undefined
  const course = ctx?.courses.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !course ||
    course.state !== "active" ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <LmsCourseArchiveButton
        organizationId={ctx.organizationId}
        orgSlug={ctx.orgSlug}
        courseId={course.id}
        archiveAction={ctx.archiveAction}
        label={ctx.archiveLabel}
      />
    </GovernedTrailingActionSlot>
  )
}
