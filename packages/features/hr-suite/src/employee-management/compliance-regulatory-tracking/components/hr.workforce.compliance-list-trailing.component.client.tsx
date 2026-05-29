"use client";

import { useActionState } from "react";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { type ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import {
  archiveHrComplianceObligationAction,
  assignHrComplianceCorrectiveActionAction,
  resolveHrComplianceExceptionAction,
  updateHrComplianceCorrectiveActionProgressAction,
  updateHrEmployeeLaborLawRequirementAction,
  waiveHrComplianceExceptionAction,
} from "../actions/hr.workforce.compliance.actions.server";
import { HRM_COMPLIANCE_REQUIREMENT_STATUSES } from "../data/hr.workforce.compliance-status.shared";
import {
  COMPLIANCE_NATIVE_SELECT_CLASS,
  formatComplianceEnumLabel,
} from "../schemas/hr.workforce.compliance-form.shared";
import { hrComplianceUiCopy } from "../surface/hr.workforce.compliance-ui.copy.shared";

function ComplianceTrailingActionForm({
  action,
  submitLabel,
  children,
  hiddenFields,
  buttonVariant = "secondary",
}: {
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  submitLabel: string;
  children?: React.ReactNode;
  hiddenFields?: React.ReactNode;
  buttonVariant?: "default" | "secondary" | "outline";
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
        disabled={pending}
      >
        {submitLabel}
      </Button>
      <ActionFormErrors result={state} />
    </form>
  );
}

export function HrComplianceObligationsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.obligations;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <ComplianceTrailingActionForm
        action={archiveHrComplianceObligationAction}
        submitLabel={copy.trailingArchiveLabel}
        buttonVariant="secondary"
        hiddenFields={
          <input type="hidden" name="obligationId" value={row.id} />
        }
      />
    </GovernedTrailingActionSlot>
  );
}

export function HrComplianceExceptionsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.exceptions;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex min-w-56 flex-col gap-surface-md">
        <ComplianceTrailingActionForm
          action={assignHrComplianceCorrectiveActionAction}
          submitLabel={copy.trailingAssignLabel}
          buttonVariant="default"
          hiddenFields={
            <input type="hidden" name="exceptionId" value={row.id} />
          }
        >
          <Field>
            <FieldLabel htmlFor={`${row.id}-corrective-description`}>
              {copy.trailingAssignLabel}
            </FieldLabel>
            <Input
              id={`${row.id}-corrective-description`}
              name="correctiveActionDescription"
              required
              placeholder={copy.trailingCorrectiveDescriptionPlaceholder}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${row.id}-corrective-due`}>
              {copy.colDue}
            </FieldLabel>
            <Input
              id={`${row.id}-corrective-due`}
              name="correctiveActionDueDate"
              required
              type="datetime-local"
              placeholder={copy.trailingCorrectiveDuePlaceholder}
            />
          </Field>
        </ComplianceTrailingActionForm>

        <ComplianceTrailingActionForm
          action={updateHrComplianceCorrectiveActionProgressAction}
          submitLabel={copy.trailingProgressLabel}
          hiddenFields={
            <input type="hidden" name="exceptionId" value={row.id} />
          }
        >
          <Field>
            <FieldLabel htmlFor={`${row.id}-progress-note`}>
              {copy.trailingProgressLabel}
            </FieldLabel>
            <Input
              id={`${row.id}-progress-note`}
              name="progressNote"
              required
              placeholder={copy.trailingProgressPlaceholder}
            />
          </Field>
        </ComplianceTrailingActionForm>

        <ComplianceTrailingActionForm
          action={resolveHrComplianceExceptionAction}
          submitLabel={copy.trailingResolveLabel}
          hiddenFields={
            <input type="hidden" name="exceptionId" value={row.id} />
          }
        >
          <Field>
            <FieldLabel htmlFor={`${row.id}-resolution-note`}>
              {copy.trailingResolveLabel}
            </FieldLabel>
            <Input
              id={`${row.id}-resolution-note`}
              name="resolutionNote"
              placeholder={copy.trailingResolutionPlaceholder}
            />
          </Field>
        </ComplianceTrailingActionForm>

        <ComplianceTrailingActionForm
          action={waiveHrComplianceExceptionAction}
          submitLabel={copy.trailingWaiveLabel}
          buttonVariant="outline"
          hiddenFields={
            <input type="hidden" name="exceptionId" value={row.id} />
          }
        >
          <Field>
            <FieldLabel htmlFor={`${row.id}-waiver-reason`}>
              {copy.trailingWaiverReasonPlaceholder}
            </FieldLabel>
            <Input
              id={`${row.id}-waiver-reason`}
              name="waiverReason"
              required
              placeholder={copy.trailingWaiverReasonPlaceholder}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${row.id}-approval-reference`}>
              {copy.trailingApprovalReferencePlaceholder}
            </FieldLabel>
            <Input
              id={`${row.id}-approval-reference`}
              name="approvalReference"
              required
              placeholder={copy.trailingApprovalReferencePlaceholder}
            />
          </Field>
        </ComplianceTrailingActionForm>
      </div>
    </GovernedTrailingActionSlot>
  );
}

export function HrComplianceLaborLawRequirementsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.laborLaw;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <ComplianceTrailingActionForm
        action={updateHrEmployeeLaborLawRequirementAction}
        submitLabel={copy.trailingMarkCompliantLabel}
        hiddenFields={
          <input type="hidden" name="requirementId" value={row.id} />
        }
      >
        <Field>
          <FieldLabel htmlFor={`${row.id}-requirement-status`}>
            {copy.trailingUpdateStatusLabel}
          </FieldLabel>
          <select
            id={`${row.id}-requirement-status`}
            name="status"
            className={COMPLIANCE_NATIVE_SELECT_CLASS}
            defaultValue="compliant"
            aria-label={copy.trailingUpdateStatusLabel}
          >
            {HRM_COMPLIANCE_REQUIREMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatComplianceEnumLabel(status)}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${row.id}-review-notes`}>
            {copy.trailingReviewNotesPlaceholder}
          </FieldLabel>
          <Input
            id={`${row.id}-review-notes`}
            name="reviewNotes"
            placeholder={copy.trailingReviewNotesPlaceholder}
          />
        </Field>
      </ComplianceTrailingActionForm>
    </GovernedTrailingActionSlot>
  );
}
