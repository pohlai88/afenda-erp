"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button, Field, FieldGroup, FieldLabel, NativeSelect, NativeSelectOption } from "@afenda/ui";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";
import { formatObjectStorageProviderLabel } from "../tenant-execution/sys-object-storage-provider.shared";
import { systemAdminSecurityUiCopy } from "./sys-security-ui.copy.shared";

type UpdateObjectStorageProviderAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminObjectStorageProviderForm({
  objectStorageProvider,
  deploymentProvider,
  updateObjectStorageProviderAction,
}: {
  objectStorageProvider: "vercel-blob" | "r2" | "s3" | null;
  deploymentProvider: "vercel-blob" | "r2" | "s3";
  updateObjectStorageProviderAction: UpdateObjectStorageProviderAction;
}) {
  const copy = systemAdminSecurityUiCopy.objectStorageProvider;
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updateObjectStorageProviderAction, undefined);

  const selectedValue = objectStorageProvider ?? "default";

  return (
    <form action={formAction} className="@container max-w-3xl">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field className="@md:col-span-2">
          <FieldLabel>{copy.fieldLabel}</FieldLabel>
          <NativeSelect name="objectStorageProvider" defaultValue={selectedValue}>
            <NativeSelectOption value="default">
              Deployment default ({formatObjectStorageProviderLabel(deploymentProvider)})
            </NativeSelectOption>
            <NativeSelectOption value="vercel-blob">Vercel Blob</NativeSelectOption>
            <NativeSelectOption value="r2">Cloudflare R2</NativeSelectOption>
            <NativeSelectOption value="s3">Amazon S3 (SSE-KMS)</NativeSelectOption>
          </NativeSelect>
        </Field>

        <p className="@md:col-span-2 type-muted">{copy.helperText}</p>

        <div className="@md:col-span-2">
          <ActionFormErrors result={state} />
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : copy.submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
