"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button, Field, FieldGroup, FieldLabel, NativeSelect } from "@afenda/ui";
import { Settings2Icon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";

type ModuleSettingsAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult>;

export function SystemAdminModuleSettingsDialog({
  updateModuleSettingsAction,
  moduleOptions,
}: {
  updateModuleSettingsAction: ModuleSettingsAction;
  moduleOptions: ReadonlyArray<{ value: string; label: string }>;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updateModuleSettingsAction, undefined);

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel>Module</FieldLabel>
          <NativeSelect name="moduleKey" defaultValue={moduleOptions[0]?.value}>
            {moduleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Enabled</FieldLabel>
          <NativeSelect name="enabled" defaultValue="true">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Visible in navigation</FieldLabel>
          <NativeSelect name="visible" defaultValue="true">
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Readiness</FieldLabel>
          <NativeSelect name="readiness" defaultValue="active">
            <option value="active">Active</option>
            <option value="preview">Preview</option>
            <option value="blocked">Blocked</option>
            <option value="deprecated">Deprecated</option>
          </NativeSelect>
        </Field>
        <div className="@md:col-span-2">
          <p className="type-muted">
            Disabling System Admin is blocked. Dangerous changes should be
            confirmed with your security owner before saving.
          </p>
        </div>
        <div className="flex items-end @md:col-span-2">
          <Button type="submit" disabled={pending}>
            <Settings2Icon data-icon="inline-start" />
            Save module settings
          </Button>
        </div>
        <div className="@md:col-span-2">
          <ActionFormErrors result={state} />
        </div>
      </FieldGroup>
    </form>
  );
}
