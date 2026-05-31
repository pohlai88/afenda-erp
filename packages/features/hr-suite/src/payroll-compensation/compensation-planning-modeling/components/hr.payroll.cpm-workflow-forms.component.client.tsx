"use client";

import { useActionState } from "react";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { type ActionResult } from "@afenda/governed-surface/schemas";
import { Badge } from "@afenda/ui/badge";
import { Button } from "@afenda/ui/button";
import { Field, FieldGroup, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import {
  finalizeCompensationApprovalFormAction,
  reviewCompensationRecommendationFormAction,
  submitCompensationRecommendationFormAction,
} from "../actions/hr.payroll.cpm.actions.server";
import { isHrCpmRecommendationLocked } from "../data/hr.payroll.cpm-lock.shared";
import { hrCpmUiCopy } from "../surface/hr.payroll.cpm-ui.copy.shared";

function CpmWorkflowFormShell({
  action,
  children,
  submitLabel,
  hiddenFields,
  disabled = false,
  buttonVariant = "default",
}: {
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  children?: React.ReactNode;
  submitLabel: string;
  hiddenFields: React.ReactNode;
  disabled?: boolean;
  buttonVariant?: "default" | "secondary" | "outline" | "destructive";
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-surface-sm">
      {hiddenFields}
      {children}
      <Button
        type="submit"
        size="sm"
        variant={buttonVariant}
        className="w-fit"
        disabled={disabled || pending}
      >
        {submitLabel}
      </Button>
      <ActionFormErrors result={state} />
    </form>
  );
}

export function HrCpmRecommendationStatusBadge({
  status,
  lockedAt,
}: {
  status: string;
  lockedAt: Date | string | null | undefined;
}) {
  const locked = isHrCpmRecommendationLocked(
    status,
    lockedAt == null ? null : new Date(lockedAt),
  );

  return (
    <div className="flex flex-wrap items-center gap-surface-xs">
      <span className="type-muted">
        {hrCpmUiCopy.approvalStatusLabel}
      </span>
      <Badge variant="outline">{status.replaceAll("_", " ")}</Badge>
      {locked ? (
        <Badge variant="secondary">{hrCpmUiCopy.lockedBadge}</Badge>
      ) : null}
    </div>
  );
}

export function HrCpmSubmitRecommendationForm({
  recommendationId,
  status,
  lockedAt,
  canSubmit,
}: {
  recommendationId: string;
  status: string;
  lockedAt: Date | string | null | undefined;
  canSubmit: boolean;
}) {
  const locked = isHrCpmRecommendationLocked(
    status,
    lockedAt == null ? null : new Date(lockedAt),
  );
  const submittable = ["draft", "returned"].includes(status);
  const disabled = locked || !submittable || !canSubmit;

  return (
    <CpmWorkflowFormShell
      action={submitCompensationRecommendationFormAction}
      submitLabel={hrCpmUiCopy.submitRecommendation}
      disabled={disabled}
      hiddenFields={
        <input type="hidden" name="recommendationId" value={recommendationId} />
      }
    />
  );
}

export function HrCpmHrReviewPanel({
  recommendationId,
  status,
  lockedAt,
  canReview,
}: {
  recommendationId: string;
  status: string;
  lockedAt: Date | string | null | undefined;
  canReview: boolean;
}) {
  const locked = isHrCpmRecommendationLocked(
    status,
    lockedAt == null ? null : new Date(lockedAt),
  );
  const reviewable = ["submitted", "hr_review"].includes(status);
  const disabled = locked || !reviewable || !canReview;

  if (!reviewable && !locked) {
    return null;
  }

  return (
    <div className="flex flex-col gap-surface-md rounded-section border border-border p-surface-md">
      <HrCpmRecommendationStatusBadge status={status} lockedAt={lockedAt} />
      <CpmWorkflowFormShell
        action={reviewCompensationRecommendationFormAction}
        submitLabel="Apply HR review"
        disabled={disabled}
        hiddenFields={
          <input type="hidden" name="recommendationId" value={recommendationId} />
        }
      >
        <FieldGroup className="grid gap-surface-md">
          <Field>
            <FieldLabel htmlFor={`cpm-decision-${recommendationId}`}>
              Review decision
            </FieldLabel>
            <select
              id={`cpm-decision-${recommendationId}`}
              name="decision"
              className="h-9 w-full rounded-control border border-input bg-background px-3 type-control"
              disabled={disabled}
              defaultValue="approve"
            >
              <option value="approve">{hrCpmUiCopy.reviewApprove}</option>
              <option value="adjust">{hrCpmUiCopy.reviewAdjust}</option>
              <option value="return">{hrCpmUiCopy.reviewReturn}</option>
              <option value="reject">{hrCpmUiCopy.reviewReject}</option>
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`cpm-notes-${recommendationId}`}>
              {hrCpmUiCopy.notesLabel}
            </FieldLabel>
            <Input
              id={`cpm-notes-${recommendationId}`}
              name="notes"
              disabled={disabled}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`cpm-salary-${recommendationId}`}>
              {hrCpmUiCopy.proposedSalaryLabel}
            </FieldLabel>
            <Input
              id={`cpm-salary-${recommendationId}`}
              name="proposedSalary"
              type="number"
              min={0}
              step="0.01"
              disabled={disabled}
            />
          </Field>
        </FieldGroup>
      </CpmWorkflowFormShell>
    </div>
  );
}

export function HrCpmFinalizeApprovalForm({
  recommendationId,
  status,
  lockedAt,
  canFinalize,
}: {
  recommendationId: string;
  status: string;
  lockedAt: Date | string | null | undefined;
  canFinalize: boolean;
}) {
  const locked = isHrCpmRecommendationLocked(
    status,
    lockedAt == null ? null : new Date(lockedAt),
  );
  const pendingApproval = status === "pending_approval";
  const disabled = locked || !pendingApproval || !canFinalize;

  if (!pendingApproval && locked) {
    return <HrCpmRecommendationStatusBadge status={status} lockedAt={lockedAt} />;
  }

  return (
    <CpmWorkflowFormShell
      action={finalizeCompensationApprovalFormAction}
      submitLabel={hrCpmUiCopy.finalizeApproval}
      disabled={disabled}
      hiddenFields={
        <input type="hidden" name="recommendationId" value={recommendationId} />
      }
    >
      <Field>
        <FieldLabel htmlFor={`cpm-effective-${recommendationId}`}>
          {hrCpmUiCopy.effectiveDateLabel}
        </FieldLabel>
        <Input
          id={`cpm-effective-${recommendationId}`}
          name="effectiveDate"
          type="date"
          required
          disabled={disabled}
        />
      </Field>
    </CpmWorkflowFormShell>
  );
}
