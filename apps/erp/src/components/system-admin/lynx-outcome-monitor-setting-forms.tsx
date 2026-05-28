import { LynxOutcomeMonitorSettingForm } from "./lynx-outcome-monitor-setting-form.client";
import type { LynxOutcomeMonitorSetting } from "./lynx-outcome-monitor.shared";

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
        <LynxOutcomeMonitorSettingForm
          key={setting.monitorId}
          setting={setting}
        />
      ))}
    </div>
  );
}
