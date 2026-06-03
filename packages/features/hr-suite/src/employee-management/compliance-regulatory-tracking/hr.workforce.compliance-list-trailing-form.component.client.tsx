"use client";

import { useActionState } from "react";

import {
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { ActionFormErrors } from "@afenda/governed-surface/client";
import { type ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import {
  COMPLIANCE_NATIVE_SELECT_CLASS,
  formatComplianceEnumLabel,
} from "./hr.workforce.compliance-form.shared";
import type { ComplianceTrailingFieldConfig } from "./hr.workforce.compliance-list-trailing.config.shared";

export function ComplianceTrailingActionForm({
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

export function ComplianceTrailingHiddenRowId({
  name,
  rowId,
}: {
  name: string;
  rowId: string;
}) {
  return <input type="hidden" name={name} value={rowId} />;
}

function resolveTrailingFieldDefaultValue(
  row: GovernedListTrailingCellProps["row"],
  field: ComplianceTrailingFieldConfig,
): string | undefined {
  const readSerializedCell = (cellId: string | undefined) => {
    if (!cellId) {
      return undefined;
    }
    const cellValue = row.cells[cellId];
    if (cellValue === undefined || cellValue === "") {
      return undefined;
    }
    return String(cellValue);
  };

  if (field.kind === "select") {
    return readSerializedCell(field.defaultFromCell) ?? field.defaultValue;
  }

  if (field.kind === "labeled-select") {
    return readSerializedCell(field.defaultFromCell);
  }

  if (field.kind === "datetime-local" || field.kind === "text") {
    return readSerializedCell(field.defaultFromCell);
  }

  return undefined;
}

export function ComplianceTrailingActionFields({
  row,
  fields,
}: {
  row: GovernedListTrailingCellProps["row"];
  fields: ComplianceTrailingFieldConfig[];
}) {
  return (
    <>
      {fields.map((field) => {
        const fieldId = `${row.id}-${field.name}`;

        if (field.kind === "select") {
          return (
            <Field key={field.name}>
              <FieldLabel htmlFor={fieldId}>{field.label}</FieldLabel>
              <select
                id={fieldId}
                name={field.name}
                className={COMPLIANCE_NATIVE_SELECT_CLASS}
                defaultValue={resolveTrailingFieldDefaultValue(row, field)}
                aria-label={field.label}
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {formatComplianceEnumLabel(option)}
                  </option>
                ))}
              </select>
            </Field>
          );
        }

        if (field.kind === "labeled-select") {
          return (
            <Field key={field.name}>
              <FieldLabel htmlFor={fieldId}>{field.label}</FieldLabel>
              <select
                id={fieldId}
                name={field.name}
                required={field.required}
                className={COMPLIANCE_NATIVE_SELECT_CLASS}
                defaultValue={resolveTrailingFieldDefaultValue(row, field) ?? ""}
                aria-label={field.label}
              >
                <option value="">
                  {field.placeholder ?? "Select"}
                </option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          );
        }

        if (field.kind === "datetime-local") {
          return (
            <Field key={field.name}>
              <FieldLabel htmlFor={fieldId}>{field.label}</FieldLabel>
              <Input
                id={fieldId}
                name={field.name}
                type="datetime-local"
                required={field.required}
                defaultValue={resolveTrailingFieldDefaultValue(row, field) ?? ""}
                placeholder={field.placeholder}
              />
            </Field>
          );
        }

        return (
          <Field key={field.name}>
            <FieldLabel htmlFor={fieldId}>{field.label}</FieldLabel>
            <Input
              id={fieldId}
              name={field.name}
              required={field.required}
              placeholder={field.placeholder}
              defaultValue={resolveTrailingFieldDefaultValue(row, field) ?? ""}
            />
          </Field>
        );
      })}
    </>
  );
}
