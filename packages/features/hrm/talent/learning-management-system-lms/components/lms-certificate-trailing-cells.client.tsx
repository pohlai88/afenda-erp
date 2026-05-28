"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"
import { Button } from "@afenda/ui/button"

type LmsCertificateTrailingContext = {
  organizationId: string
  orgSlug: string
  renewAction: (formData: FormData) => void | Promise<void>
  renewLabel: string
  certificates: readonly { id: string; status: string }[]
}

export function LmsCertificateTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as LmsCertificateTrailingContext | undefined
  const cert = ctx?.certificates.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !cert ||
    !isListSurfaceTrailingActionRenderable(trailingAction) ||
    (cert.status !== "issued" && cert.status !== "expired")
  ) {
    return null
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <form action={ctx.renewAction}>
        <input type="hidden" name="organizationId" value={ctx.organizationId} />
        <input type="hidden" name="orgSlug" value={ctx.orgSlug} />
        <input type="hidden" name="certificateId" value={cert.id} />
        <Button type="submit" variant="ghost" size="sm" className="h-7 text-xs">
          {ctx.renewLabel}
        </Button>
      </form>
    </GovernedTrailingActionSlot>
  )
}
