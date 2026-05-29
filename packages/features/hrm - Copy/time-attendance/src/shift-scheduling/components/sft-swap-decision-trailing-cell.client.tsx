"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { SftSwapDecisionForms } from "./sft-swap-decision-form.client"

type SftSwapContext = {
  id: string
}

type SftSwapDecisionTrailingContext = {
  swaps: readonly SftSwapContext[]
}

export function SftSwapDecisionTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const swaps = (context as SftSwapDecisionTrailingContext | undefined)?.swaps
  if (!swaps?.some((entry) => entry.id === row.id)) {
    return null
  }
  const trailingAction = row.trailingAction
  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <SftSwapDecisionForms swapRequestId={row.id} />
    </GovernedTrailingActionSlot>
  )
}
