"use client"

import { Button } from "@afenda/ui/button"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { completeOffboardingTaskFormAction } from "../actions/offboarding.actions"
import { OffboardingApprovalActions } from "./offboarding-approval-actions.client"

type OffboardingChecklistTrailingContext = {
  orgSlug: string
  employeeId: string
  instanceId: string
  markDoneLabel: string
  tasks: readonly { taskKey: string; completedAt: string | null }[]
}

export function OffboardingChecklistTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as OffboardingChecklistTrailingContext | undefined
  const task = ctx?.tasks.find((entry) => entry.taskKey === row.id)
  if (!ctx || !task || task.completedAt) {
    return null
  }
  return (
    <form action={completeOffboardingTaskFormAction}>
      <input type="hidden" name="orgSlug" value={ctx.orgSlug} />
      <input type="hidden" name="employeeId" value={ctx.employeeId} />
      <input type="hidden" name="instanceId" value={ctx.instanceId} />
      <input type="hidden" name="taskKey" value={task.taskKey} />
      <Button type="submit" size="sm" variant="secondary">
        {ctx.markDoneLabel}
      </Button>
    </form>
  )
}

type OffboardingOverviewTrailingContext = {
  orgSlug: string
  capabilities: Parameters<typeof OffboardingApprovalActions>[0]["capabilities"]
  rows: readonly {
    id: string
    employeeId: string
    status: string
  }[]
}

export function OffboardingOverviewTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as OffboardingOverviewTrailingContext | undefined
  const match = ctx?.rows.find((entry) => entry.id === row.id)
  if (!ctx || !match || match.status !== "pending_approval") {
    return null
  }
  return (
    <OffboardingApprovalActions
      orgSlug={ctx.orgSlug}
      employeeId={match.employeeId}
      instanceId={match.id}
      capabilities={ctx.capabilities}
    />
  )
}
