"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button, Field, FieldGroup, FieldLabel, Input } from "@afenda/ui";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import type { SystemAdminBillingContactRow } from "../contracts/system-admin.billing-list.contract";
import { systemAdminBillingUiCopy } from "../surface/system-admin.billing-ui.copy.shared";

type UpdateBillingContactsAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

function contactDefaults(
  contacts: readonly SystemAdminBillingContactRow[],
  role: SystemAdminBillingContactRow["role"],
) {
  const row = contacts.find((entry) => entry.role === role);
  return { name: row?.name ?? "", email: row?.email ?? "" };
}

export function SystemAdminBillingContactsForm({
  contacts,
  updateBillingContactsAction,
}: {
  contacts: readonly SystemAdminBillingContactRow[];
  updateBillingContactsAction: UpdateBillingContactsAction;
}) {
  const primary = contactDefaults(contacts, "primary");
  const invoice = contactDefaults(contacts, "invoice");
  const procurement = contactDefaults(contacts, "procurement");
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updateBillingContactsAction, undefined);

  return (
    <form action={formAction} className="@container max-w-xl">
      <FieldGroup className="flex flex-col gap-surface-md">
        <Field>
          <FieldLabel>Primary contact name</FieldLabel>
          <Input
            name="primaryName"
            defaultValue={primary.name}
            required
            autoComplete="name"
          />
        </Field>
        <Field>
          <FieldLabel>Primary contact email</FieldLabel>
          <Input
            name="primaryEmail"
            type="email"
            defaultValue={primary.email}
            required
            autoComplete="email"
          />
        </Field>
        <Field>
          <FieldLabel>Invoice contact name</FieldLabel>
          <Input name="invoiceName" defaultValue={invoice.name} autoComplete="name" />
        </Field>
        <Field>
          <FieldLabel>Invoice contact email</FieldLabel>
          <Input
            name="invoiceEmail"
            type="email"
            defaultValue={invoice.email}
            autoComplete="email"
          />
        </Field>
        <Field>
          <FieldLabel>Procurement contact name</FieldLabel>
          <Input
            name="procurementName"
            defaultValue={procurement.name}
            autoComplete="name"
          />
        </Field>
        <Field>
          <FieldLabel>Procurement contact email</FieldLabel>
          <Input
            name="procurementEmail"
            type="email"
            defaultValue={procurement.email}
            autoComplete="email"
          />
        </Field>
        <ActionFormErrors result={state} />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save billing contacts"}
        </Button>
      </FieldGroup>
      <p className="type-caption mt-surface-sm">{systemAdminBillingUiCopy.contacts.formDescription}</p>
    </form>
  );
}
