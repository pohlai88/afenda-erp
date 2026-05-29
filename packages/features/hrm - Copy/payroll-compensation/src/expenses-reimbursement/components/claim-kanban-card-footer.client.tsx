"use client"

import { useTranslations } from "next-intl"

import Link from "next/link"
import { Button } from "@afenda/ui/button"

import { organizationHrmClaimPath } from "@afenda/feature-hrm-core/shared"
import type { ClaimStateValue } from "../data/claim-helpers.shared"

import { ClaimDecisionForms } from "./claim-decision-form"

export type ClaimKanbanCardContext = {
  claimId: string
  state: ClaimStateValue
  label: string
  requestedAmount: string
  currency: string
  canDecide: boolean
}

export function ClaimKanbanCardFooter({
  orgSlug,
  context,
}: {
  orgSlug: string
  context: ClaimKanbanCardContext
}) {
  const t = useTranslations("Erp.Hrm.claims")

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="link"
        size="sm"
        className="h-auto justify-start px-0 text-xs"
        asChild
      >
        <Link href={organizationHrmClaimPath(orgSlug, context.claimId)}>
          {t("kanban.viewDetail")}
        </Link>
      </Button>
      {context.canDecide && context.state === "submitted" ? (
        <div className="flex flex-wrap gap-1">
          <ClaimDecisionForms
            claimId={context.claimId}
            label={context.label}
            requestedAmount={context.requestedAmount}
            currency={context.currency}
          />
        </div>
      ) : null}
    </div>
  )
}
