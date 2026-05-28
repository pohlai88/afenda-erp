"use client"

import type { Route } from "next"

import { Button } from "@afenda/ui/button"
import { Input } from "@afenda/ui/input"
import { Textarea } from "@afenda/ui/textarea"
import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"
import Link from "next/link"

import type { ComplianceEvidenceRegisterTrailingRow } from "./compliance-evidence-register-trailing.client"
import { ComplianceEvidenceRegisterTrailing } from "./compliance-evidence-register-trailing.client"
import { archiveComplianceObligationFormAction } from "../actions/compliance-obligation.actions"
import {
  assignComplianceCorrectiveActionFormAction,
  resolveComplianceExceptionFormAction,
  updateComplianceCorrectiveActionProgressFormAction,
  waiveComplianceExceptionFormAction,
} from "../actions/compliance-exception.actions"
import {
  completeFilingFormAction,
  updateFilingFormAction,
  waiveFilingFormAction,
} from "../actions/compliance-filing.actions"

export type ComplianceFilingsTrailingLabels = {
  submissionReferencePlaceholder: string
  markSubmitted: string
  authorityConfirmationPlaceholder: string
  confirm: string
  waiverReasonPlaceholder: string
  approvalReferencePlaceholder: string
  waive: string
}

type ComplianceFilingsTrailingContext = {
  orgSlug: string
  labels: ComplianceFilingsTrailingLabels
}

export function ComplianceFilingsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as ComplianceFilingsTrailingContext | undefined
  const trailingAction = row.trailingAction
  if (!ctx || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  const { orgSlug, labels } = ctx
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="grid min-w-[16rem] gap-2">
        <form action={updateFilingFormAction} className="flex flex-col gap-2">
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="filingId" value={row.id} />
          <Input name="submittedAt" type="date" required className="text-xs" />
          <Input
            name="confirmationReference"
            placeholder={labels.submissionReferencePlaceholder}
            className="text-xs"
          />
          <Button type="submit" size="sm" variant="secondary" className="w-fit">
            {labels.markSubmitted}
          </Button>
        </form>
        <form action={completeFilingFormAction} className="flex flex-col gap-2">
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="filingId" value={row.id} />
          <Input name="confirmedAt" type="date" required className="text-xs" />
          <Input
            name="confirmationReference"
            placeholder={labels.authorityConfirmationPlaceholder}
            required
            className="text-xs"
          />
          <Button type="submit" size="sm" variant="outline" className="w-fit">
            {labels.confirm}
          </Button>
        </form>
        <form action={waiveFilingFormAction} className="flex flex-col gap-2">
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="filingId" value={row.id} />
          <Textarea
            name="waiverReason"
            required
            rows={2}
            placeholder={labels.waiverReasonPlaceholder}
            className="text-xs"
          />
          <Input
            name="approvalReference"
            required
            placeholder={labels.approvalReferencePlaceholder}
            className="text-xs"
          />
          <Button type="submit" size="sm" variant="outline" className="w-fit">
            {labels.waive}
          </Button>
        </form>
      </div>
    </GovernedTrailingActionSlot>
  )
}

type ComplianceObligationsTrailingContext = {
  orgSlug: string
  archiveSubmitLabel: string
  rowById: Readonly<Record<string, { id: string; status: string }>>
}

export function ComplianceObligationsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as ComplianceObligationsTrailingContext | undefined
  const match = ctx?.rowById?.[row.id]
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !match ||
    match.status === "archived" ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <form action={archiveComplianceObligationFormAction}>
        <input type="hidden" name="orgSlug" value={ctx.orgSlug} />
        <input type="hidden" name="obligationId" value={match.id} />
        <Button type="submit" size="sm" variant="secondary">
          {ctx.archiveSubmitLabel}
        </Button>
      </form>
    </GovernedTrailingActionSlot>
  )
}

export type ComplianceExceptionsTrailingLabels = {
  ownerUserIdPlaceholder: string
  correctiveActionPlaceholder: string
  assignSubmit: string
  progressNotePlaceholder: string
  evidenceDocumentIdPlaceholder: string
  progressSubmit: string
  resolvePlaceholder: string
  resolveSubmit: string
  waiveReasonPlaceholder: string
  waiveRefPlaceholder: string
  waiveSubmit: string
}

type ComplianceExceptionsTrailingContext = {
  orgSlug: string
  labels: ComplianceExceptionsTrailingLabels
}

export function ComplianceExceptionsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as ComplianceExceptionsTrailingContext | undefined
  const trailingAction = row.trailingAction
  if (!ctx || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  const { orgSlug, labels } = ctx
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="grid min-w-[18rem] gap-2">
        <form
          action={assignComplianceCorrectiveActionFormAction}
          className="flex flex-col gap-2"
        >
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="exceptionId" value={row.id} />
          <Input
            name="correctiveActionOwnerUserId"
            required
            placeholder={labels.ownerUserIdPlaceholder}
            className="text-xs"
          />
          <Input
            name="correctiveActionDueDate"
            required
            type="date"
            className="text-xs"
          />
          <Textarea
            name="correctiveActionDescription"
            required
            placeholder={labels.correctiveActionPlaceholder}
            rows={2}
            className="text-xs"
          />
          <Button type="submit" size="sm" className="w-fit">
            {labels.assignSubmit}
          </Button>
        </form>
        <form
          action={updateComplianceCorrectiveActionProgressFormAction}
          className="flex flex-col gap-2"
        >
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="exceptionId" value={row.id} />
          <Textarea
            name="progressNote"
            required
            placeholder={labels.progressNotePlaceholder}
            rows={2}
            className="text-xs"
          />
          <Input
            name="evidenceDocumentId"
            placeholder={labels.evidenceDocumentIdPlaceholder}
            className="text-xs"
          />
          <Button type="submit" size="sm" variant="secondary" className="w-fit">
            {labels.progressSubmit}
          </Button>
        </form>
        <form
          action={resolveComplianceExceptionFormAction}
          className="flex flex-col gap-2"
        >
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="exceptionId" value={row.id} />
          <Textarea
            name="resolutionNote"
            required
            placeholder={labels.resolvePlaceholder}
            rows={2}
            className="text-xs"
          />
          <Button type="submit" size="sm" variant="secondary" className="w-fit">
            {labels.resolveSubmit}
          </Button>
        </form>
        <form
          action={waiveComplianceExceptionFormAction}
          className="flex flex-col gap-2"
        >
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="exceptionId" value={row.id} />
          <Textarea
            name="waiverReason"
            required
            placeholder={labels.waiveReasonPlaceholder}
            rows={2}
            className="text-xs"
          />
          <Input
            name="approvalReference"
            required
            placeholder={labels.waiveRefPlaceholder}
            className="text-xs"
          />
          <Button type="submit" size="sm" variant="outline" className="w-fit">
            {labels.waiveSubmit}
          </Button>
        </form>
      </div>
    </GovernedTrailingActionSlot>
  )
}

type ComplianceHealthSamplesTrailingContext = {
  rowById: Readonly<
    Record<
      string,
      {
        id: string
        inspectHref: string
        inspectLabel: string
        inspectAria: string
      }
    >
  >
}

type ComplianceEvidenceRegisterTrailingContext = {
  orgSlug: string
  rowById: Readonly<Record<string, ComplianceEvidenceRegisterTrailingRow>>
}

export function ComplianceEvidenceRegisterTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as ComplianceEvidenceRegisterTrailingContext | undefined
  const match = ctx?.rowById?.[row.id]
  if (!ctx || !match) {
    return null
  }
  return (
    <ComplianceEvidenceRegisterTrailing row={match} orgSlug={ctx.orgSlug} />
  )
}

export function ComplianceHealthSamplesTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as ComplianceHealthSamplesTrailingContext | undefined
  const sample = ctx?.rowById?.[row.id]
  const trailingAction = row.trailingAction
  if (!sample || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <Link
        href={sample.inspectHref as Route}
        className="text-sm text-primary underline-offset-2 hover:underline"
        aria-label={sample.inspectAria}
      >
        {sample.inspectLabel}
      </Link>
    </GovernedTrailingActionSlot>
  )
}
