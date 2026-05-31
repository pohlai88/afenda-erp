"use client";

import { useActionState } from "react";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import { attachHrExpenseReceiptAction } from "../actions/hr.payroll.expense.actions.server";
import { hrExpenseUiCopy } from "../surface/hr.payroll.expense-ui.copy.shared";

/** HRM-EXP-003 — client bridge for receipt reference capture after file pick. */
export function HrExpenseReceiptUploadForm({
  claimId,
  defaultReference,
}: {
  claimId: string;
  defaultReference?: string;
}) {
  const [state, formAction, pending] = useActionState(
    attachHrExpenseReceiptAction,
    undefined,
  );
  const copy = hrExpenseUiCopy.receipt;

  return (
    <form action={formAction} className="flex flex-col gap-surface-sm">
      <input type="hidden" name="claimId" value={claimId} />
      <Field>
        <FieldLabel htmlFor={`receipt-file-${claimId}`}>{copy.uploadLabel}</FieldLabel>
        <Input
          id={`receipt-file-${claimId}`}
          name="receiptFile"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(event) => {
            const file = event.target.files?.[0];
            const referenceInput = document.getElementById(
              `receipt-ref-${claimId}`,
            ) as HTMLInputElement | null;
            if (file && referenceInput) {
              referenceInput.value = `receipt://${file.name}`;
            }
          }}
        />
        <p className="type-caption">{copy.uploadHint}</p>
      </Field>
      <Field>
        <FieldLabel htmlFor={`receipt-ref-${claimId}`}>
          {hrExpenseUiCopy.submit.formReferenceLabel}
        </FieldLabel>
        <Input
          id={`receipt-ref-${claimId}`}
          name="receiptReference"
          defaultValue={defaultReference}
          required
        />
      </Field>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Save receipt reference
      </Button>
      <ActionFormErrors result={state as ActionResult | undefined} />
    </form>
  );
}
