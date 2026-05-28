"use client"

import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { BenefitPlanRow } from "../data/benefit-model.shared"
import type { BenefitProviderRow } from "../data/benefit-provider.queries.server"
import { BenefitArchivePlanForm } from "./benefit-archive-plan-form"
import { BenefitClaimReferenceUpdateForm } from "./benefit-claim-reference-update-form"
import { BenefitLifeEventVerifyActions } from "./benefit-life-event-verify-actions"
import { BenefitPlanEditDialog } from "./benefit-plan-edit-dialog"
import type { BenefitProviderChoice } from "./benefit-plan-form"
import { BenefitProviderEditDialog } from "./benefit-provider-edit-dialog"
import type { BenefitProviderFormRow } from "./benefit-provider-form"

type BenefitClaimReferenceTrailingContext = {
  rows: readonly {
    id: string
    claimStatus: string
    claimedAmount: string | null
    paymentReference: string | null
  }[]
}

export function BenefitClaimReferenceTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as BenefitClaimReferenceTrailingContext | undefined
  const claimRef = ctx?.rows.find((entry) => entry.id === row.id)
  if (!claimRef) {
    return null
  }
  return (
    <BenefitClaimReferenceUpdateForm
      claimReferenceId={claimRef.id}
      claimStatus={claimRef.claimStatus}
      claimedAmount={claimRef.claimedAmount}
      paymentReference={claimRef.paymentReference}
    />
  )
}

type BenefitLifeEventsTrailingContext = {
  rows: readonly { id: string; verificationStatus: string }[]
}

export function BenefitLifeEventsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as BenefitLifeEventsTrailingContext | undefined
  const lifeEvent = ctx?.rows.find((entry) => entry.id === row.id)
  if (!lifeEvent || lifeEvent.verificationStatus !== "pending") {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  return <BenefitLifeEventVerifyActions lifeEventId={lifeEvent.id} />
}

type BenefitPlansTrailingContext = {
  plans: readonly BenefitPlanRow[]
  providers: readonly BenefitProviderChoice[]
}

export function BenefitPlansTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as BenefitPlansTrailingContext | undefined
  const plan = ctx?.plans.find((entry) => entry.id === row.id)
  if (!ctx || !plan) {
    return null
  }
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <BenefitPlanEditDialog plan={plan} providers={ctx.providers} />
      {plan.isActive ? (
        <BenefitArchivePlanForm planId={plan.id} planLabel={plan.name} />
      ) : null}
    </div>
  )
}

function toFormRow(provider: BenefitProviderRow): BenefitProviderFormRow {
  return {
    id: provider.id,
    code: provider.code,
    name: provider.name,
    countryCodes: provider.countryCodes,
    externalReference: provider.externalReference,
    isActive: provider.isActive,
  }
}

type BenefitProvidersTrailingContext = {
  providers: readonly BenefitProviderRow[]
}

export function BenefitProvidersTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as BenefitProvidersTrailingContext | undefined
  const provider = ctx?.providers.find((entry) => entry.id === row.id)
  if (!provider) {
    return null
  }
  return <BenefitProviderEditDialog provider={toFormRow(provider)} />
}
