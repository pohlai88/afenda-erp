"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { FrmExceptionResolveTrailing } from "./frm-exception-resolve-trailing.client"

export function FrmExceptionTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction
  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <FrmExceptionResolveTrailing exceptionId={row.id} />
    </GovernedTrailingActionSlot>
  )
}
