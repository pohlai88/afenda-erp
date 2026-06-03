"use client";

import { useActionState } from "react";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { Field, FieldGroup, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@afenda/ui/select";
import { Textarea } from "@afenda/ui/textarea";

import { submitHrExpenseClaimAction } from "./hr.payroll.expense.actions.server";
import { hrExpenseCategoryOptions } from "./hr.payroll.expense-form.shared";
import { hrExpenseUiCopy } from "./hr.payroll.expense-ui.copy.shared";

export function HrExpenseClaimSubmitForm() {
  const [state, formAction, pending] = useActionState(
    submitHrExpenseClaimAction,
    undefined,
  );
  const copy = hrExpenseUiCopy.submit;

  return (
    <form action={formAction} className="flex flex-col gap-surface-md">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="expense-date">Expense date</FieldLabel>
          <Input id="expense-date" name="expenseDate" type="date" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="expense-category">Category</FieldLabel>
          <Select name="category" required>
            <SelectTrigger id="expense-category" className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {hrExpenseCategoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="expense-amount">Amount</FieldLabel>
          <Input
            id="expense-amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="expense-currency">Currency</FieldLabel>
          <Input
            id="expense-currency"
            name="currencyCode"
            defaultValue="MYR"
            maxLength={3}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="expense-description">Description</FieldLabel>
          <Textarea id="expense-description" name="description" required rows={3} />
        </Field>
        <Field>
          <FieldLabel htmlFor="expense-receipt-ref">{copy.formReferenceLabel}</FieldLabel>
          <Input
            id="expense-receipt-ref"
            name="receiptReference"
            placeholder={copy.formReferencePlaceholder}
          />
          <p className="type-caption">{copy.receiptRequiredHint}</p>
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={pending}>
        {copy.formSubmitLabel}
      </Button>
      <ActionFormErrors result={state as ActionResult | undefined} />
    </form>
  );
}
