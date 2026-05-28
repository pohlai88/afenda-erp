import {
  buildSystemAdminLynxOutcomeMonitorSurface,
  getSystemAdminLynxOutcomeMonitorState,
  lynxOutcomeMonitorControlSurfaceKey,
  type SystemAdminLynxOutcomeMonitorState,
} from "../surfaces/system-admin.lynx-outcome-monitor.surface.server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type { SystemAdminActionResult } from "../contracts";
import { LynxOutcomeMonitorSettingForms } from "./system-admin.lynx-outcome-monitor-setting-forms.component.server";
import type { LynxOutcomeMonitorSetting } from "../contracts";
import { LynxOutcomeMonitorTrailingCell } from "./system-admin.lynx-outcome-monitor-trailing-cell.component.client";

type UpdateLynxOutcomeMonitorSettingAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export async function LynxOutcomeMonitorSection({
  organizationId,
  canWrite,
  updateLynxOutcomeMonitorSettingAction,
  preloaded,
  title = "Lynx outcome monitors",
  description = "Deterministic proactive monitors for Lynx operator sessions. Solution console runs remain the product surface for run analytics.",
  listTitle = "Monitor settings",
  listDescription = "Per-monitor enablement, thresholds, and severity policy for this tenant. Use Configure to jump to the editor below.",
}: {
  organizationId: string;
  canWrite: boolean;
  updateLynxOutcomeMonitorSettingAction: UpdateLynxOutcomeMonitorSettingAction;
  preloaded?: Pick<SystemAdminLynxOutcomeMonitorState, "monitorSettings">;
  title?: string;
  description?: string;
  listTitle?: string;
  listDescription?: string;
}) {
  const monitorSettings: LynxOutcomeMonitorSetting[] =
    preloaded?.monitorSettings ??
    (
      await getSystemAdminLynxOutcomeMonitorState({
        organizationId,
        canMutate: canWrite,
      })
    ).monitorSettings;

  const surface = buildSystemAdminLynxOutcomeMonitorSurface({
    monitorSettings,
    canMutate: canWrite,
  });

  return (
    <SectionPanel title={title} description={description}>
      <div className="flex flex-col gap-4">
        <GovernedPatternCListSection
          title={listTitle}
          description={listDescription}
          surfaceKey={lynxOutcomeMonitorControlSurfaceKey}
          listConfiguration={surface}
          parentAccessAllowed
          layout="embedded"
          trailingColumn={{
            header: "Actions",
            Cell: LynxOutcomeMonitorTrailingCell,
          }}
        />
        <LynxOutcomeMonitorSettingForms
          canWrite={canWrite}
          monitorSettings={monitorSettings}
          updateLynxOutcomeMonitorSettingAction={
            updateLynxOutcomeMonitorSettingAction
          }
        />
      </div>
    </SectionPanel>
  );
}
