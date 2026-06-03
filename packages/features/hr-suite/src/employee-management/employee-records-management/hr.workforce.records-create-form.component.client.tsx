"use client";

import { useActionState } from "react";

import { type ActionResult } from "@afenda/governed-surface/schemas";
import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Field, FieldGroup, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import { createHrEmployeeRecordAction } from "./hr.workforce.records.actions.server";
import { hrRecordsUiCopy } from "./hr.workforce.records-ui.copy.shared";

export function HrRecordsCreateEmployeeForm() {
  const copy = hrRecordsUiCopy.create;
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(createHrEmployeeRecordAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-surface-md">
      <FieldGroup className="grid gap-surface-md @md/field-group:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="records-create-employee-number">
            {copy.employeeNumberLabel}
          </FieldLabel>
          <Input
            id="records-create-employee-number"
            name="employeeNumber"
            required
            autoComplete="off"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="records-create-legal-name">
            {copy.legalNameLabel}
          </FieldLabel>
          <Input
            id="records-create-legal-name"
            name="legalName"
            required
            autoComplete="name"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="records-create-preferred-name">
            {copy.preferredNameLabel}
          </FieldLabel>
          <Input
            id="records-create-preferred-name"
            name="preferredName"
            autoComplete="nickname"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="records-create-email">{copy.emailLabel}</FieldLabel>
          <Input
            id="records-create-email"
            name="email"
            type="email"
            autoComplete="email"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="records-create-employment-start">
            {copy.employmentStartDateLabel}
          </FieldLabel>
          <Input
            id="records-create-employment-start"
            name="employmentStartDate"
            type="date"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="records-create-employment-type">
            {copy.employmentTypeLabel}
          </FieldLabel>
          <Input
            id="records-create-employment-type"
            name="employmentType"
            autoComplete="off"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="records-create-identity-number">
            {copy.identityNumberLabel}
          </FieldLabel>
          <Input
            id="records-create-identity-number"
            name="identityNumber"
            autoComplete="off"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="records-create-phone">{copy.phoneNumberLabel}</FieldLabel>
          <Input
            id="records-create-phone"
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="records-create-personal-email">
            {copy.personalEmailLabel}
          </FieldLabel>
          <Input
            id="records-create-personal-email"
            name="personalEmail"
            type="email"
            autoComplete="email"
          />
        </Field>
        <Field className="@md/field-group:col-span-2">
          <Button type="submit" size="sm" disabled={pending}>
            {copy.submitLabel}
          </Button>
        </Field>
      </FieldGroup>
      <ActionFormErrors result={state} />
    </form>
  );
}
