"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { SystemAdminActionResult } from "@afenda/feature-system-admin/client";
import { systemAdminLynxOutcomeMonitorThresholdCatalog } from "@afenda/feature-system-admin/client";
import { Button, Input, NativeSelect, NativeSelectOption } from "@afenda/ui";
import { useActionState } from "react";

import { updateLynxOutcomeMonitorSettingAction } from "@/app/(app)/system-admin/machine-layer/actions";
import {
  readMonitorSeverityMode,
  readMonitorThresholdNumber,
  type LynxOutcomeMonitorSetting,
} from "./lynx-outcome-monitor.shared";

export function LynxOutcomeMonitorSettingForm({
  setting,
}: {
  setting: LynxOutcomeMonitorSetting;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updateLynxOutcomeMonitorSettingAction, undefined);

  const thresholdFields =
    systemAdminLynxOutcomeMonitorThresholdCatalog.find(
      (entry) => entry.monitorId === setting.monitorId,
    )?.fields ?? [];

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-md border border-line bg-card p-3 scroll-mt-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      id={`lynx-monitor-form-${setting.monitorId}`}
      tabIndex={-1}
    >
      <input name="monitorId" type="hidden" value={setting.monitorId} />
      <div className="text-sm font-medium text-foreground">
        {setting.monitorId}
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted-foreground">Enabled</span>
        <NativeSelect
          className="w-full"
          defaultValue={setting.enabled ? "true" : "false"}
          name="enabled"
        >
          <NativeSelectOption value="true">Enabled</NativeSelectOption>
          <NativeSelectOption value="false">Disabled</NativeSelectOption>
        </NativeSelect>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted-foreground">Owner auth user id</span>
        <Input
          defaultValue={setting.ownerAuthUserId ?? ""}
          name="ownerAuthUserId"
          placeholder="optional owner"
        />
      </label>
      {thresholdFields.map((field) => (
        <label className="flex flex-col gap-2 text-sm" key={field.key}>
          <span className="text-muted-foreground">{field.label}</span>
          <Input
            defaultValue={readMonitorThresholdNumber(
              setting.thresholds,
              field.key,
              field.defaultValue,
            )}
            min={0}
            name={`threshold.${field.key}`}
            type="number"
          />
        </label>
      ))}
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted-foreground">Severity mode</span>
        <NativeSelect
          className="w-full"
          defaultValue={readMonitorSeverityMode(setting.severityPolicy)}
          name="severityMode"
        >
          <NativeSelectOption value="standard">Standard</NativeSelectOption>
          <NativeSelectOption value="observe">Observe</NativeSelectOption>
          <NativeSelectOption value="critical">Critical</NativeSelectOption>
        </NativeSelect>
      </label>
      <ActionFormErrors result={state} />
      {state?.ok ? (
        <p className="text-sm text-muted-foreground" role="status">
          Monitor settings saved.
        </p>
      ) : null}
      <Button disabled={pending} type="submit">
        {pending ? "Saving…" : "Save monitor"}
      </Button>
    </form>
  );
}
