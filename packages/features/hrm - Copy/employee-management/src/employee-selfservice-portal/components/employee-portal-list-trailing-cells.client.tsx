"use client"

import type { Route } from "next"

import { Button } from "@afenda/ui/button"
import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"
import Link from "next/link"

import {
  employeePortalPath,
  employeePortalPerformanceGoalPath,
} from "@afenda/platform/portal"

import { isClaimCancellable } from "@afenda/feature-hrm-payroll-compensation/client"
import { downloadPortalEmployeeDocumentAction } from "../actions/employee-portal-document.actions"
import { submitPortalSelfAttestTraining } from "../actions/training-portal.actions"
import { EmployeePortalAdvanceCancelButton } from "./employee-portal-advance-cancel-button"
import { EmployeePortalClaimCancelButton } from "./employee-portal-claim-cancel-button.client"
import { EmployeePortalLeaveCancelButton } from "./employee-portal-leave-cancel-button"
import { EmployeePortalTrainingFeedbackForm } from "./employee-portal-training-feedback-form"

function claimDetailHref(portalSlug: string, claimId: string): Route {
  return `${employeePortalPath(portalSlug, "claims")}/${claimId}` as Route
}

type EmployeePortalClaimsTrailingContext = {
  portalSlug: string
  viewDetailLabel: string
  cancelLabel: string
  claims: readonly { id: string; state: string }[]
}

export function EmployeePortalClaimsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as EmployeePortalClaimsTrailingContext | undefined
  const claim = ctx?.claims.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !claim ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={claimDetailHref(ctx.portalSlug, claim.id)}>
            {ctx.viewDetailLabel}
          </Link>
        </Button>
        {isClaimCancellable(claim.state) ? (
          <EmployeePortalClaimCancelButton
            portalSlug={ctx.portalSlug}
            claimId={claim.id}
            label={ctx.cancelLabel}
          />
        ) : null}
      </div>
    </GovernedTrailingActionSlot>
  )
}

type EmployeePortalClaimEvidenceTrailingContext = {
  evidence: readonly { id: string; documentBlobUrl: string | null }[]
}

export function EmployeePortalClaimEvidenceTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as EmployeePortalClaimEvidenceTrailingContext | undefined
  const ev = ctx?.evidence.find((entry) => entry.id === row.id)
  if (!ev?.documentBlobUrl) {
    return null
  }
  return (
    <Button variant="outline" size="sm" asChild>
      <a href={ev.documentBlobUrl} target="_blank" rel="noopener noreferrer">
        Open
      </a>
    </Button>
  )
}

type EmployeePortalDocumentsTrailingContext = {
  portalSlug: string
  downloadLabel: string
  documents: readonly { id: string; canDownload: boolean }[]
}

export function EmployeePortalDocumentsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as EmployeePortalDocumentsTrailingContext | undefined
  const doc = ctx?.documents.find((entry) => entry.id === row.id)
  if (!ctx || !doc) {
    return null
  }
  return (
    <form action={downloadPortalEmployeeDocumentAction}>
      <input type="hidden" name="portalSlug" value={ctx.portalSlug} />
      <input type="hidden" name="documentId" value={doc.id} />
      <Button
        variant="outline"
        size="sm"
        type="submit"
        disabled={!doc.canDownload}
      >
        {ctx.downloadLabel}
      </Button>
    </form>
  )
}

function performanceGoalHref(portalSlug: string, goalId: string): Route {
  return employeePortalPerformanceGoalPath(portalSlug, goalId)
}

type EmployeePortalPerformanceTrailingContext = {
  portalSlug: string
  viewGoalLabel: string
  goals: readonly { id: string }[]
}

export function EmployeePortalPerformanceTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as EmployeePortalPerformanceTrailingContext | undefined
  const goal = ctx?.goals.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (!ctx || !goal || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <Link
        href={performanceGoalHref(ctx.portalSlug, goal.id)}
        className="text-sm font-medium text-primary hover:underline"
      >
        {ctx.viewGoalLabel}
      </Link>
    </GovernedTrailingActionSlot>
  )
}

type EmployeePortalAdvancesTrailingContext = {
  portalSlug: string
  advances: readonly { id: string; state: string }[]
}

export function EmployeePortalAdvancesTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as EmployeePortalAdvancesTrailingContext | undefined
  const advance = ctx?.advances.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !advance ||
    advance.state !== "pending" ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <EmployeePortalAdvanceCancelButton
        portalSlug={ctx.portalSlug}
        advanceId={advance.id}
      />
    </GovernedTrailingActionSlot>
  )
}

type EmployeePortalLeaveTrailingContext = {
  portalSlug: string
  requests: readonly { id: string; state: string }[]
}

export function EmployeePortalLeaveTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as EmployeePortalLeaveTrailingContext | undefined
  const request = ctx?.requests.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !request ||
    request.state !== "submitted" ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <EmployeePortalLeaveCancelButton
        portalSlug={ctx.portalSlug}
        requestId={request.id}
      />
    </GovernedTrailingActionSlot>
  )
}

type EmployeePortalTrainingDueTrailingContext = {
  portalSlug: string
  attestLabel: string
  completedAt: string
  assignments: readonly {
    id: string
    courseId: string
    sessionId: string | null
  }[]
}

export function EmployeePortalTrainingDueTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as EmployeePortalTrainingDueTrailingContext | undefined
  const assignment = ctx?.assignments.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !assignment ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <form
        action={submitPortalSelfAttestTraining}
        className="flex flex-wrap items-end gap-2"
      >
        <input type="hidden" name="portalSlug" value={ctx.portalSlug} />
        <input type="hidden" name="assignmentId" value={assignment.id} />
        <input type="hidden" name="courseId" value={assignment.courseId} />
        <input
          type="hidden"
          name="sessionId"
          value={assignment.sessionId ?? ""}
        />
        <input type="hidden" name="completedAt" value={ctx.completedAt} />
        <button
          type="submit"
          className="text-xs font-medium text-primary hover:underline"
        >
          {ctx.attestLabel}
        </button>
      </form>
    </GovernedTrailingActionSlot>
  )
}

type EmployeePortalTrainingHistoryTrailingContext = {
  portalSlug: string
  organizationId: string
  records: readonly {
    id: string
    courseName: string
    feedbackRating: number | null
  }[]
}

export function EmployeePortalTrainingHistoryTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as
    | EmployeePortalTrainingHistoryTrailingContext
    | undefined
  const record = ctx?.records.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !record ||
    record.feedbackRating ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <EmployeePortalTrainingFeedbackForm
        portalSlug={ctx.portalSlug}
        organizationId={ctx.organizationId}
        recordId={record.id}
        courseName={record.courseName}
      />
    </GovernedTrailingActionSlot>
  )
}
