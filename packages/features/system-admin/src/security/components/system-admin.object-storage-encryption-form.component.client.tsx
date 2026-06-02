"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button, Field, FieldGroup, FieldLabel, Input, NativeSelect, NativeSelectOption } from "@afenda/ui";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminSecurityUiCopy } from "../surface/system-admin.security-ui.copy.shared";

type UpdateEncryptionSettingsAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminObjectStorageEncryptionForm({
  encryptionMode,
  kmsAdapter,
  kmsKeyRef,
  updateEncryptionSettingsAction,
}: {
  encryptionMode: "platform" | "customer-managed";
  kmsAdapter: "vault-transit" | "aws-kms" | null;
  kmsKeyRef: string | null;
  updateEncryptionSettingsAction: UpdateEncryptionSettingsAction;
}) {
  const copy = systemAdminSecurityUiCopy.objectStorageEncryption;
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updateEncryptionSettingsAction, undefined);

  return (
    <form action={formAction} className="@container max-w-3xl">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field className="@md:col-span-2">
          <FieldLabel>{copy.modeFieldLabel}</FieldLabel>
          <NativeSelect name="encryptionMode" defaultValue={encryptionMode}>
            <NativeSelectOption value="platform">Platform (provider SSE)</NativeSelectOption>
            <NativeSelectOption value="customer-managed">
              Customer-managed envelope (Vault / AWS KMS)
            </NativeSelectOption>
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel>{copy.adapterFieldLabel}</FieldLabel>
          <NativeSelect
            name="kmsAdapter"
            defaultValue={kmsAdapter ?? ""}
          >
            <NativeSelectOption value="">Select adapter</NativeSelectOption>
            <NativeSelectOption value="vault-transit">Vault Transit</NativeSelectOption>
            <NativeSelectOption value="aws-kms">AWS KMS</NativeSelectOption>
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel>{copy.keyRefFieldLabel}</FieldLabel>
          <Input
            name="kmsKeyRef"
            defaultValue={kmsKeyRef ?? ""}
            placeholder={copy.keyRefPlaceholder}
          />
        </Field>

        <p className="@md:col-span-2 type-muted">{copy.helperText}</p>

        <div className="@md:col-span-2">
          <ActionFormErrors result={state} />
          <Button type="submit" disabled={pending}>
            {copy.submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
