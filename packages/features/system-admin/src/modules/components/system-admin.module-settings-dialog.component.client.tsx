"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { NativeSelect } from "@afenda/ui/native-select";
import { Settings2Icon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../contracts";

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
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Module</span>
        <NativeSelect name="moduleKey" defaultValue={moduleOptions[0]?.value}>
          {moduleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Enabled</span>
        <NativeSelect name="enabled" defaultValue="true">
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </NativeSelect>
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Visible in navigation</span>
        <NativeSelect name="visible" defaultValue="true">
          <option value="true">Visible</option>
          <option value="false">Hidden</option>
        </NativeSelect>
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Readiness</span>
        <NativeSelect name="readiness" defaultValue="active">
          <option value="active">Active</option>
          <option value="preview">Preview</option>
          <option value="blocked">Blocked</option>
          <option value="deprecated">Deprecated</option>
        </NativeSelect>
      </label>
      <div className="md:col-span-2">
        <p className="type-muted">
          Disabling System Admin is blocked. Dangerous changes should be
          confirmed with your security owner before saving.
        </p>
      </div>
      <div className="flex items-end md:col-span-2">
        <Button type="submit" disabled={pending}>
          <Settings2Icon data-icon="inline-start" />
          Save module settings
        </Button>
      </div>
      <div className="md:col-span-2">
        <ActionFormErrors result={state} />
      </div>
    </form>
  );
}
