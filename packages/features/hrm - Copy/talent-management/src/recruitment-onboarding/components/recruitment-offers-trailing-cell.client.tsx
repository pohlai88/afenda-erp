"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { JobOfferRow } from "../data/recruitment.queries.server"
import { RecruitmentOfferTrailing } from "./recruitment-offer-trailing.client"

type RecruitmentOffersTrailingContext = {
  orgSlug: string
  labels: {
    approveOffer: string
    sendOffer: string
    acceptOffer: string
    rejectOffer: string
    withdrawOffer: string
    convertHire: string
    fieldEmployeeNumber: string
    converted: string
  }
  offers: readonly JobOfferRow[]
}

export function RecruitmentOffersTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as RecruitmentOffersTrailingContext | undefined
  const offer = ctx?.offers.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !offer ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <RecruitmentOfferTrailing
        orgSlug={ctx.orgSlug}
        offer={offer}
        labels={ctx.labels}
      />
    </GovernedTrailingActionSlot>
  )
}
