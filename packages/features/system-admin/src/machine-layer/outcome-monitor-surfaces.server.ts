import "server-only";

import { getLynxOutcomeMonitorSettings } from "@afenda/db";
import { LYNX_OUTCOME_MONITOR_IDS } from "@afenda/feature-lynx";
import {
  buildLynxOutcomeMonitorControlListSurface,
  lynxOutcomeMonitorControlSurfaceKey,
} from "@afenda/feature-lynx/metadata";

export { lynxOutcomeMonitorControlSurfaceKey };

export async function getSystemAdminLynxOutcomeMonitorState(input: {
  organizationId: string;
  canMutate: boolean;
}) {
  const monitorSettings = await getLynxOutcomeMonitorSettings({
    organizationId: input.organizationId,
    monitorIds: LYNX_OUTCOME_MONITOR_IDS,
  });

  const surface = buildLynxOutcomeMonitorControlListSurface({
    canMutate: input.canMutate,
    rows: monitorSettings.map((setting) => ({
      id: setting.monitorId,
      monitorId: setting.monitorId,
      enabled: setting.enabled ? "enabled" : "disabled",
      ownerAuthUserId: setting.ownerAuthUserId ?? "-",
      thresholds: JSON.stringify(setting.thresholds),
      severityPolicy: JSON.stringify(setting.severityPolicy),
      updatedAt: setting.updatedAt.toLocaleString(),
    })),
  });

  return { monitorSettings, surface };
}
