"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

type EmployeeDocumentVaultTrailingContext = {
  openLabel: string
  documents: readonly { id: string; blobUrl: string }[]
}

export function EmployeeDocumentVaultTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as EmployeeDocumentVaultTrailingContext | undefined
  const doc = ctx?.documents.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (!ctx || !doc || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <a
        href={doc.blobUrl}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 text-sm text-primary underline-offset-4 hover:underline"
      >
        {ctx.openLabel}
      </a>
    </GovernedTrailingActionSlot>
  )
}
