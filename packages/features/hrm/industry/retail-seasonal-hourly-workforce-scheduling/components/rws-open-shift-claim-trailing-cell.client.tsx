"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { RwsOpenShiftClaimForm } from "./rws-open-shift-claim-form.client"

type RwsOpenShiftEmployeeChoice = {
  readonly id: string
  readonly employeeNumber: string | null
  readonly legalName: string
}

type RwsOpenShiftTemplateChoice = {
  readonly id: string
  readonly code: string
  readonly name: string
}

type RwsOpenShiftClaimTrailingContext = {
  offers: readonly { readonly id: string }[]
  employees: readonly RwsOpenShiftEmployeeChoice[]
  templates: readonly RwsOpenShiftTemplateChoice[]
}

export function RwsOpenShiftClaimTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as RwsOpenShiftClaimTrailingContext | undefined
  if (!ctx?.offers.some((entry) => entry.id === row.id)) {
    return null
  }
  const trailingAction = row.trailingAction
  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <RwsOpenShiftClaimForm
        openShiftOfferId={row.id}
        employees={ctx.employees}
        templates={ctx.templates}
      />
    </GovernedTrailingActionSlot>
  )
}
