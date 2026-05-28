"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { NativeSelect } from "@afenda/ui/native-select";
import { ShieldIcon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../contracts";

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
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Capability</span>
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
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Availability</span>
        <NativeSelect name="availability" defaultValue="enabled">
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
          <option value="preview">Preview</option>
        </NativeSelect>
      </label>
      <div className="md:col-span-2">
        <p className="type-muted">
          Capability availability is stored per organization and audited. The
          execution kernel remains the source of capability truth.
        </p>
      </div>
      <div className="flex items-end md:col-span-2">
        <Button type="submit" disabled={pending}>
          <ShieldIcon data-icon="inline-start" />
          Save capability setting
        </Button>
      </div>
      <div className="md:col-span-2">
        <ActionFormErrors result={state} />
      </div>
    </form>
  );
}
