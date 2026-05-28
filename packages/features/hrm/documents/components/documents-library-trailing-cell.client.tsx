"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { HrmDocumentDownloadForm } from "./hrm-document-download-form"
import {
  HrmDocumentRejectForm,
  HrmDocumentVerifyForm,
} from "./hrm-document-review-forms"

type DocumentsLibraryTrailingContext = {
  orgSlug: string
  canReview: boolean
  canDownload: boolean
  downloadLabel: string
  rows: readonly { id: string; verificationStatus: string }[]
}

export function DocumentsLibraryTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as DocumentsLibraryTrailingContext | undefined
  const match = ctx?.rows.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !match ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  const showReview = ctx.canReview && match.verificationStatus === "pending"
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap items-center justify-end gap-1">
        {showReview ? (
          <>
            <HrmDocumentVerifyForm
              orgSlug={ctx.orgSlug}
              documentId={match.id}
            />
            <HrmDocumentRejectForm
              orgSlug={ctx.orgSlug}
              documentId={match.id}
            />
          </>
        ) : null}
        {ctx.canDownload ? (
          <HrmDocumentDownloadForm
            orgSlug={ctx.orgSlug}
            documentId={match.id}
            label={ctx.downloadLabel}
          />
        ) : null}
      </div>
    </GovernedTrailingActionSlot>
  )
}
