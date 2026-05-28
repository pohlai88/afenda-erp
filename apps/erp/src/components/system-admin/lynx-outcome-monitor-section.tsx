import {
  getSystemAdminLynxOutcomeMonitorState,
  lynxOutcomeMonitorControlSurfaceKey,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import { LynxOutcomeMonitorSettingForms } from "./lynx-outcome-monitor-setting-forms";
import { LynxOutcomeMonitorTrailingCell } from "./lynx-outcome-monitor-trailing-cell.client";

export async function LynxOutcomeMonitorSection({
  organizationId,
  canWrite,
}: {
  organizationId: string;
  canWrite: boolean;
}) {
  const { monitorSettings, surface } = await getSystemAdminLynxOutcomeMonitorState({
    organizationId,
    canMutate: canWrite,
  });

  return (
    <SectionPanel
      title="Lynx outcome monitors"
      description="Deterministic proactive monitors for Lynx operator sessions. Solution console runs remain the product surface for run analytics."
    >
      <GovernedPatternCListSection
        title="Monitor settings"
        description="Per-monitor enablement, thresholds, and severity policy for this tenant. Use Configure to jump to the editor below."
        surfaceKey={lynxOutcomeMonitorControlSurfaceKey}
        listConfiguration={surface}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{ header: "Actions", Cell: LynxOutcomeMonitorTrailingCell }}
      />

      <div className="mt-4">
        <LynxOutcomeMonitorSettingForms
          canWrite={canWrite}
          monitorSettings={monitorSettings}
        />
      </div>
    </SectionPanel>
  );
}
