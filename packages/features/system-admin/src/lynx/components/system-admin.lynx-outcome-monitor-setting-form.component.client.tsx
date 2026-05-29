"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import {
  Button,
  Field,
  FieldLabel,
  Input,
  NativeSelect,
  NativeSelectOption,
} from "@afenda/ui";
import { useActionState } from "react";

import type { SystemAdminActionResult } from "../contracts";
import { systemAdminLynxOutcomeMonitorThresholdCatalog } from "../contracts";
import {
  readMonitorSeverityMode,
  readMonitorThresholdNumber,
  type LynxOutcomeMonitorSetting,
} from "../contracts";

type UpdateLynxOutcomeMonitorSettingAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function LynxOutcomeMonitorSettingForm({
  setting,
  updateLynxOutcomeMonitorSettingAction,
}: {
  setting: LynxOutcomeMonitorSetting;
  updateLynxOutcomeMonitorSettingAction: UpdateLynxOutcomeMonitorSettingAction;
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
      className="flex flex-col gap-3 rounded-section border border-line bg-card p-3 scroll-mt-surface-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      id={`lynx-monitor-form-${setting.monitorId}`}
      tabIndex={-1}
    >
      <input name="monitorId" type="hidden" value={setting.monitorId} />
      <div className="type-body font-medium text-foreground">
        {setting.monitorId}
      </div>
      <Field>
        <FieldLabel>Enabled</FieldLabel>
        <NativeSelect
          className="w-full"
          defaultValue={setting.enabled ? "true" : "false"}
          name="enabled"
        >
          <NativeSelectOption value="true">Enabled</NativeSelectOption>
          <NativeSelectOption value="false">Disabled</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel>Owner auth user id</FieldLabel>
        <Input
          defaultValue={setting.ownerAuthUserId ?? ""}
          name="ownerAuthUserId"
          placeholder="optional owner"
        />
      </Field>
      {thresholdFields.map((field) => (
        <Field key={field.key}>
          <FieldLabel>{field.label}</FieldLabel>
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
        </Field>
      ))}
      <Field>
        <FieldLabel>Severity mode</FieldLabel>
        <NativeSelect
          className="w-full"
          defaultValue={readMonitorSeverityMode(setting.severityPolicy)}
          name="severityMode"
        >
          <NativeSelectOption value="standard">Standard</NativeSelectOption>
          <NativeSelectOption value="observe">Observe</NativeSelectOption>
          <NativeSelectOption value="critical">Critical</NativeSelectOption>
        </NativeSelect>
      </Field>
      <ActionFormErrors result={state} />
      {state?.ok ? (
        <p className="type-muted" role="status">
          Monitor settings saved.
        </p>
      ) : null}
      <Button disabled={pending} type="submit">
        {pending ? "Saving…" : "Save monitor"}
      </Button>
    </form>
  );
}
