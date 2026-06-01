"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button, Field, FieldGroup, FieldLabel, NativeSelect } from "@afenda/ui";
import { ShieldIcon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";

type CapabilitySettingsAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult>;

export function SystemAdminCapabilitySettingsDialog({
  updateCapabilitySettingsAction,
  capabilityOptions,
}: {
  updateCapabilitySettingsAction: CapabilitySettingsAction;
  capabilityOptions: ReadonlyArray<{ value: string; label: string }>;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updateCapabilitySettingsAction, undefined);

  return (
    <form action={formAction} className="@container" data-testid="system-admin-capabilities-settings-form">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel>Capability</FieldLabel>
          <NativeSelect
            name="capabilityKey"
            defaultValue={capabilityOptions[0]?.value}
          >
            {capabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Availability</FieldLabel>
          <NativeSelect name="availability" defaultValue="enabled">
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
            <option value="preview">Preview</option>
          </NativeSelect>
        </Field>
        <div className="@md:col-span-2">
          <p className="type-muted">
            Capability availability is stored per organization and audited. The
            execution kernel remains the source of capability truth.
          </p>
        </div>
        <div className="flex items-end @md:col-span-2">
          <Button type="submit" disabled={pending} data-testid="system-admin-capabilities-settings-submit">
            <ShieldIcon data-icon="inline-start" />
            Save capability setting
          </Button>
        </div>
        <div className="@md:col-span-2">
          <ActionFormErrors result={state} />
        </div>
      </FieldGroup>
    </form>
  );
}
