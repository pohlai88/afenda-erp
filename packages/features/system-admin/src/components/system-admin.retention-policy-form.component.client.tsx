"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button, Input, NativeSelect, NativeSelectOption } from "@afenda/ui";
import { useActionState } from "react";

import type { SystemAdminActionResult } from "../contracts";

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
    <form action={formAction} className="grid max-w-xl gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Entity type</span>
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
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Retention days</span>
        <Input
          name="retentionDays"
          type="number"
          min={1}
          max={3650}
          defaultValue={365}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Legal hold</span>
        <NativeSelect className="w-full" name="legalHold" defaultValue="false">
          <NativeSelectOption value="false">Standard</NativeSelectOption>
          <NativeSelectOption value="true">On hold</NativeSelectOption>
        </NativeSelect>
      </label>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <ActionFormErrors result={state} />
        {state?.ok ? (
          <p className="text-sm text-muted-foreground" role="status">
            Retention policy saved.
          </p>
        ) : null}
        <div className="flex items-end">
          <Button disabled={pending} type="submit">
            {pending ? "Saving…" : "Save retention policy"}
          </Button>
        </div>
      </div>
    </form>
  );
}
