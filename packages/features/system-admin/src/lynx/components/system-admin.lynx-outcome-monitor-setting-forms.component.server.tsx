import { LynxOutcomeMonitorSettingForm } from "./system-admin.lynx-outcome-monitor-setting-form.component.client";
import type { SystemAdminActionResult } from "../contracts";
import type { LynxOutcomeMonitorSetting } from "../contracts";

type UpdateLynxOutcomeMonitorSettingAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function LynxOutcomeMonitorSettingForms({
  monitorSettings,
  canWrite,
  updateLynxOutcomeMonitorSettingAction,
}: {
  monitorSettings: readonly LynxOutcomeMonitorSetting[];
  canWrite: boolean;
  updateLynxOutcomeMonitorSettingAction: UpdateLynxOutcomeMonitorSettingAction;
}) {
  if (!canWrite) {
    return (
      <p className="type-muted">
        Monitor configuration changes require
        system-admin.lynx.approve.
      </p>
    );
  }

  return (
    <div className="@container grid gap-3 @md:grid-cols-2 @xl:grid-cols-3">
      {monitorSettings.map((setting) => (
        <LynxOutcomeMonitorSettingForm
          key={setting.monitorId}
          setting={setting}
          updateLynxOutcomeMonitorSettingAction={
            updateLynxOutcomeMonitorSettingAction
          }
        />
      ))}
    </div>
  );
}
