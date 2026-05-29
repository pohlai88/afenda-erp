"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { HrmOnboardingStepForm } from "./hrm-onboarding-step-form"

export function HrmOnboardingTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const orgSlug = context?.orgSlug
  if (typeof orgSlug !== "string" || orgSlug.length === 0) {
    return null
  }

  const trailingAction = row.trailingAction
  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }

  const disabled = trailingAction.state === "disabled"
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <HrmOnboardingStepForm
        orgSlug={orgSlug}
        contractId={row.id}
        disabled={disabled}
        disabledReason={trailingAction.disabledReason}
      />
    </GovernedTrailingActionSlot>
  )
}
