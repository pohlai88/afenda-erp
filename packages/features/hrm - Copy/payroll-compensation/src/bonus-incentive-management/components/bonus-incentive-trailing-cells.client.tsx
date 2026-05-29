"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type {
  BonusCycleRow,
  BonusEmployeeChoice,
  BonusPayrollPeriodChoice,
  BonusPayoutRow,
} from "../data/bonus-incentive.queries.server"
import {
  BonusCycleActionPanel,
  BonusPayoutActionPanel,
} from "./bonus-incentive-forms"

type BonusCyclesTrailingContext = {
  cycles: readonly BonusCycleRow[]
  employees: readonly BonusEmployeeChoice[]
}

export function BonusCyclesTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as BonusCyclesTrailingContext | undefined
  const cycle = ctx?.cycles.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !cycle ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <BonusCycleActionPanel cycle={cycle} employees={ctx.employees} />
    </GovernedTrailingActionSlot>
  )
}

type BonusPayoutsTrailingContext = {
  payouts: readonly BonusPayoutRow[]
  payrollPeriods: readonly BonusPayrollPeriodChoice[]
}

export function BonusPayoutsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as BonusPayoutsTrailingContext | undefined
  const payout = ctx?.payouts.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !payout ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <BonusPayoutActionPanel
        payout={payout}
        payrollPeriods={ctx.payrollPeriods}
      />
    </GovernedTrailingActionSlot>
  )
}
