"use client";

import { useActionState } from "react";

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import {
  approveHrExpenseClaimAction,
  rejectHrExpenseClaimAction,
  requestHrExpenseClarificationAction,
  returnHrExpenseClaimAction,
} from "../actions/hr.payroll.expense.actions.server";
import { hrExpenseUiCopy } from "../surface/hr.payroll.expense-ui.copy.shared";

function ExpenseTrailingForm({
  action,
  submitLabel,
  claimId,
  children,
  buttonVariant = "outline",
}: {
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  submitLabel: string;
  claimId: string;
  children?: React.ReactNode;
  buttonVariant?: "default" | "secondary" | "outline";
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-surface-sm"
      onSubmit={(event) => {
        event.preventDefault();
        event.currentTarget.requestSubmit();
      }}
    >
      <input type="hidden" name="claimId" value={claimId} />
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

/** HRM-EXP-018 — approve, reject, return, request clarification. */
export function HrExpenseClaimsTrailingCell({ row }: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrExpenseUiCopy.claims;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-col gap-surface-sm">
        <ExpenseTrailingForm
          action={approveHrExpenseClaimAction}
          submitLabel={copy.trailingApproveLabel}
          claimId={row.id}
          buttonVariant="secondary"
        />
        <ExpenseTrailingForm
          action={rejectHrExpenseClaimAction}
          submitLabel={copy.trailingRejectLabel}
          claimId={row.id}
        >
          <Field>
            <FieldLabel htmlFor={`reject-reason-${row.id}`}>
              {copy.trailingRejectReasonLabel}
            </FieldLabel>
            <Input
              id={`reject-reason-${row.id}`}
              name="rejectionReason"
              required
            />
          </Field>
        </ExpenseTrailingForm>
        <ExpenseTrailingForm
          action={returnHrExpenseClaimAction}
          submitLabel={copy.trailingReturnLabel}
          claimId={row.id}
        >
          <Field>
            <FieldLabel htmlFor={`return-reason-${row.id}`}>
              {copy.trailingReturnReasonLabel}
            </FieldLabel>
            <Input id={`return-reason-${row.id}`} name="returnReason" required />
          </Field>
        </ExpenseTrailingForm>
        <ExpenseTrailingForm
          action={requestHrExpenseClarificationAction}
          submitLabel={copy.trailingClarifyLabel}
          claimId={row.id}
        >
          <Field>
            <FieldLabel htmlFor={`clarify-note-${row.id}`}>
              {copy.trailingClarifyNoteLabel}
            </FieldLabel>
            <Input
              id={`clarify-note-${row.id}`}
              name="clarificationNote"
              required
            />
          </Field>
        </ExpenseTrailingForm>
      </div>
    </GovernedTrailingActionSlot>
  );
}
