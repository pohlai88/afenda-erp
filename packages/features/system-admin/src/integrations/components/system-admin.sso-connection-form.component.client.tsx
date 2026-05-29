"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button, Field, FieldGroup, FieldLabel, Input, NativeSelect, NativeSelectOption } from "@afenda/ui";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";

type UpsertSsoConnectionFormAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminSsoConnectionForm({
  upsertSsoConnectionFormAction,
}: {
  upsertSsoConnectionFormAction: UpsertSsoConnectionFormAction;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(upsertSsoConnectionFormAction, undefined);

  return (
    <form
      action={formAction}
      className="@container grid max-w-xl gap-surface-lg @sm:grid-cols-2"
    >
      <Field className="@sm:col-span-2">
        <FieldLabel>Provider</FieldLabel>
        <Input name="provider" placeholder="okta" required />
      </Field>
      <Field className="@sm:col-span-2">
        <FieldLabel>IdP metadata URL</FieldLabel>
        <Input name="idpMetadataUrl" type="url" />
      </Field>
      <Field className="@sm:col-span-2">
        <FieldLabel>Audience</FieldLabel>
        <Input name="audience" />
      </Field>
      <Field>
        <FieldLabel>Staged status</FieldLabel>
        <NativeSelect name="enabled" defaultValue="false">
          <NativeSelectOption value="false">Disabled</NativeSelectOption>
          <NativeSelectOption value="true">Staged</NativeSelectOption>
        </NativeSelect>
      </Field>
      <FieldGroup className="@sm:col-span-2 flex flex-col gap-surface-sm">
        <ActionFormErrors result={state} />
        <div>
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? "Saving…" : "Save SSO config"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
