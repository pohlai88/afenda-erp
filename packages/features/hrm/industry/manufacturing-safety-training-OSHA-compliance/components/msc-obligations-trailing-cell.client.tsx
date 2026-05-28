"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { MscEmployeeObligationRow } from "../data/msc.types.shared"
import { MscObligationRecordsTrailing } from "./msc-obligation-records-trailing.client"

type MscObligationsTrailingContext = {
  obligations: readonly MscEmployeeObligationRow[]
}

export function MscObligationsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as MscObligationsTrailingContext | undefined
  const obligation = ctx?.obligations.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !obligation ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <MscObligationRecordsTrailing obligation={obligation} />
    </GovernedTrailingActionSlot>
  )
}
