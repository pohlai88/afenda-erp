import {
  buildSystemAdminLynxOutcomeMonitorSurface,
  getSystemAdminLynxOutcomeMonitorState,
  lynxOutcomeMonitorControlSurfaceKey,
  type SystemAdminLynxOutcomeMonitorState,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import { LynxOutcomeMonitorSettingForms } from "./lynx-outcome-monitor-setting-forms";
import type { LynxOutcomeMonitorSetting } from "./lynx-outcome-monitor.shared";
import { LynxOutcomeMonitorTrailingCell } from "./lynx-outcome-monitor-trailing-cell.client";

export async function LynxOutcomeMonitorSection({
  organizationId,
  canWrite,
  preloaded,
  title = "Lynx outcome monitors",
  description = "Deterministic proactive monitors for Lynx operator sessions. Solution console runs remain the product surface for run analytics.",
  listTitle = "Monitor settings",
  listDescription = "Per-monitor enablement, thresholds, and severity policy for this tenant. Use Configure to jump to the editor below.",
}: {
  organizationId: string;
  canWrite: boolean;
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
          trailingColumn={{ header: "Actions", Cell: LynxOutcomeMonitorTrailingCell }}
        />
        <LynxOutcomeMonitorSettingForms
          canWrite={canWrite}
          monitorSettings={monitorSettings}
        />
      </div>
    </SectionPanel>
  );
}
