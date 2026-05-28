import { formatErpDateTime } from "@afenda/kernel";
import {
  getLynxOutcomeMonitorSettings,
  type LynxOutcomeMonitorSetting,
} from "@afenda/db";
import { LYNX_OUTCOME_MONITOR_IDS } from "@afenda/feature-lynx";
import {
  buildLynxOutcomeMonitorControlListSurface,
  lynxOutcomeMonitorControlSurfaceKey,
  type LynxOutcomeMonitorControlRow,
} from "@afenda/feature-lynx/metadata";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

export { lynxOutcomeMonitorControlSurfaceKey };

export type SystemAdminLynxOutcomeMonitorState = {
  monitorSettings: LynxOutcomeMonitorSetting[];
  surface: ListSurfaceRendererConfigurationResolvedInput;
};

function toMonitorControlRows(
  monitorSettings: readonly LynxOutcomeMonitorSetting[],
): LynxOutcomeMonitorControlRow[] {
  return monitorSettings.map((setting) => ({
    id: setting.monitorId,
    monitorId: setting.monitorId,
    enabled: setting.enabled ? "enabled" : "disabled",
    ownerAuthUserId: setting.ownerAuthUserId ?? "-",
    thresholds: JSON.stringify(setting.thresholds),
    severityPolicy: JSON.stringify(setting.severityPolicy),
    updatedAt: formatErpDateTime(setting.updatedAt),
  }));
}

export function buildSystemAdminLynxOutcomeMonitorSurface(input: {
  monitorSettings: readonly LynxOutcomeMonitorSetting[];
  canMutate: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLynxOutcomeMonitorControlListSurface({
    canMutate: input.canMutate,
    rows: toMonitorControlRows(input.monitorSettings),
  });
}

export async function getSystemAdminLynxOutcomeMonitorState(input: {
  organizationId: string;
  canMutate: boolean;
}): Promise<SystemAdminLynxOutcomeMonitorState> {
  const monitorSettings = await getLynxOutcomeMonitorSettings({
    organizationId: input.organizationId,
    monitorIds: LYNX_OUTCOME_MONITOR_IDS,
  });

  return {
    monitorSettings,
    surface: buildSystemAdminLynxOutcomeMonitorSurface({
      monitorSettings,
      canMutate: input.canMutate,
    }),
  };
}
