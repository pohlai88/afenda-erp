import { systemAdminLynxOutcomeMonitorThresholdCatalog } from "@afenda/feature-system-admin/client";
import { Button, Input, NativeSelect, NativeSelectOption } from "@afenda/ui";

import { updateLynxOutcomeMonitorSettingForm } from "@/app/(app)/system-admin/machine-layer/actions";

type LynxOutcomeMonitorSetting = {
  monitorId: string;
  enabled: boolean;
  ownerAuthUserId: string | null;
  thresholds: Record<string, unknown>;
  severityPolicy: Record<string, unknown>;
};

function thresholdNumber(
  thresholds: Record<string, unknown>,
  key: string,
  fallback: number,
) {
  const value = thresholds[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function severityMode(severityPolicy: Record<string, unknown>) {
  return typeof severityPolicy.mode === "string"
    ? severityPolicy.mode
    : "standard";
}

export function LynxOutcomeMonitorSettingForms({
  monitorSettings,
  canWrite,
}: {
  monitorSettings: readonly LynxOutcomeMonitorSetting[];
  canWrite: boolean;
}) {
  if (!canWrite) {
    return (
      <p className="text-sm text-muted-foreground">
        Monitor configuration changes require system-admin.machine-layer.approve.
      </p>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {monitorSettings.map((setting) => (
        <form
          action={updateLynxOutcomeMonitorSettingForm}
          className="flex flex-col gap-3 rounded-md border border-line bg-card p-3 scroll-mt-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          id={`lynx-monitor-form-${setting.monitorId}`}
          key={setting.monitorId}
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
          {systemAdminLynxOutcomeMonitorThresholdCatalog
            .find((entry) => entry.monitorId === setting.monitorId)
            ?.fields.map((field) => (
              <label className="flex flex-col gap-2 text-sm" key={field.key}>
                <span className="text-muted-foreground">{field.label}</span>
                <Input
                  defaultValue={thresholdNumber(
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
              defaultValue={severityMode(setting.severityPolicy)}
              name="severityMode"
            >
              <NativeSelectOption value="standard">Standard</NativeSelectOption>
              <NativeSelectOption value="observe">Observe</NativeSelectOption>
              <NativeSelectOption value="critical">Critical</NativeSelectOption>
            </NativeSelect>
          </label>
          <Button type="submit">Save monitor</Button>
        </form>
      ))}
    </div>
  );
}
