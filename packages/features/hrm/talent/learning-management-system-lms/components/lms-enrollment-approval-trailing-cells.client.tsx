"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"
import { Button } from "@afenda/ui/button"

type LmsEnrollmentApprovalTrailingContext = {
  organizationId: string
  orgSlug: string
  approveAction: (formData: FormData) => void | Promise<void>
  rejectAction: (formData: FormData) => void | Promise<void>
  approveLabel: string
  rejectLabel: string
  enrollments: readonly { id: string }[]
}

export function LmsEnrollmentApprovalTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as LmsEnrollmentApprovalTrailingContext | undefined
  const enrollment = ctx?.enrollments.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !enrollment ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap items-center gap-1">
        <form action={ctx.approveAction}>
          <input
            type="hidden"
            name="organizationId"
            value={ctx.organizationId}
          />
          <input type="hidden" name="orgSlug" value={ctx.orgSlug} />
          <input type="hidden" name="enrollmentId" value={enrollment.id} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
          >
            {ctx.approveLabel}
          </Button>
        </form>
        <form action={ctx.rejectAction}>
          <input
            type="hidden"
            name="organizationId"
            value={ctx.organizationId}
          />
          <input type="hidden" name="orgSlug" value={ctx.orgSlug} />
          <input type="hidden" name="enrollmentId" value={enrollment.id} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
          >
            {ctx.rejectLabel}
          </Button>
        </form>
      </div>
    </GovernedTrailingActionSlot>
  )
}
