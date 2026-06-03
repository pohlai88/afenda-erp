"use client";

import { useActionState } from "react";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import { HrObjectStorageFileField } from "../../client";
import { attachHrExpenseClaimReceiptAction } from "./hr.payroll.expense-receipt.actions.server";
import { hrExpenseUiCopy } from "./hr.payroll.expense-ui.copy.shared";

/** HRM-EXP-003 — upload receipt via object storage, then attach to claim. */
export function HrExpenseReceiptUploadForm({
  claimId,
  employeeId,
  defaultTitle,
}: {
  claimId: string;
  employeeId: string;
  defaultTitle?: string;
}) {
  const [state, formAction, pending] = useActionState(
    attachHrExpenseClaimReceiptAction,
    undefined,
  );
  const copy = hrExpenseUiCopy.receipt;

  return (
    <form action={formAction} className="flex flex-col gap-surface-sm">
      <input type="hidden" name="claimId" value={claimId} />
      <input type="hidden" name="employeeId" value={employeeId} />
      <input type="hidden" name="kind" value="receipt" />
      <Field>
        <FieldLabel htmlFor={`receipt-title-${claimId}`}>
          {hrExpenseUiCopy.submit.formReferenceLabel}
        </FieldLabel>
        <Input
          id={`receipt-title-${claimId}`}
          name="title"
          defaultValue={defaultTitle}
          required
        />
      </Field>
      <HrObjectStorageFileField
        moduleId="hr"
        idPrefix={`receipt-${claimId}`}
        label={copy.uploadLabel}
        hint={copy.uploadHint}
        defaultTitle={defaultTitle}
        onUploaded={() => undefined}
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Saving receipt…" : "Attach receipt"}
      </Button>
      <ActionFormErrors result={state as ActionResult | undefined} />
    </form>
  );
}
