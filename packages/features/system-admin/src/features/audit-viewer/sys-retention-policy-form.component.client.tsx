"use client";

import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  NativeSelect,
  NativeSelectOption,
} from "@afenda/ui";
import { ActionFormErrors } from "@afenda/governed-surface/client";
import { useActionState } from "react";

import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";

type UpsertRetentionPolicyAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function RetentionPolicyForm({
  upsertRetentionPolicyAction,
}: {
  upsertRetentionPolicyAction: UpsertRetentionPolicyAction;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(upsertRetentionPolicyAction, undefined);

  return (
    <form action={formAction} className="@container max-w-xl">
      <FieldGroup className="grid gap-surface-md @sm:grid-cols-2">
        <Field className="@sm:col-span-2">
          <FieldLabel>Entity type</FieldLabel>
          <NativeSelect
            className="w-full"
            name="entityType"
            defaultValue="document"
            required
          >
            <NativeSelectOption value="organization">
              organization
            </NativeSelectOption>
            <NativeSelectOption value="membership">membership</NativeSelectOption>
            <NativeSelectOption value="user-profile">
              user-profile
            </NativeSelectOption>
            <NativeSelectOption value="erp-record">erp-record</NativeSelectOption>
            <NativeSelectOption value="workflow-item">
              workflow-item
            </NativeSelectOption>
            <NativeSelectOption value="saved-view">saved-view</NativeSelectOption>
            <NativeSelectOption value="document">document</NativeSelectOption>
            <NativeSelectOption value="system">system</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Retention days</FieldLabel>
          <Input
            name="retentionDays"
            type="number"
            min={1}
            max={3650}
            defaultValue={365}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Legal hold</FieldLabel>
          <NativeSelect className="w-full" name="legalHold" defaultValue="false">
            <NativeSelectOption value="false">Standard</NativeSelectOption>
            <NativeSelectOption value="true">On hold</NativeSelectOption>
          </NativeSelect>
        </Field>
        <div className="flex flex-col gap-3 @sm:col-span-2">
          <ActionFormErrors result={state} />
          {state?.ok ? (
            <p className="type-muted" role="status">
              Retention policy saved.
            </p>
          ) : null}
          <div className="flex items-end">
            <Button disabled={pending} type="submit">
              {pending ? "Saving…" : "Save retention policy"}
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
}
