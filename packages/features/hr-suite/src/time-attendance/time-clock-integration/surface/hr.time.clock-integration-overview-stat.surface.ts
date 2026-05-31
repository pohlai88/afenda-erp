import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import type { HrTimeClockOverviewSnapshot } from "@afenda/db";

import { hrTimeClockUiCopy } from "./hr.time.clock-integration-ui.copy.shared";

export const hrTimeClockOverviewStatSurfaceKey =
  "hr.time.clock-integration.overview.stats";

export function buildHrTimeClockOverviewStatGrid(input: {
  snapshot: HrTimeClockOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrTimeClockUiCopy.overview;
  const snapshot = input.snapshot;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.deviceCount,
        value: snapshot.deviceCount.toLocaleString("en-US"),
        tone: "default",
      },
      {
        label: copy.activeDevices,
        value: snapshot.activeDeviceCount.toLocaleString("en-US"),
        tone: "default",
      },
      {
        label: copy.openExceptions,
        value: snapshot.openExceptionCount.toLocaleString("en-US"),
        tone: snapshot.openExceptionCount > 0 ? "attention" : "default",
      },
      {
        label: copy.failedSyncs,
        value: snapshot.failedSyncCount.toLocaleString("en-US"),
        tone: snapshot.failedSyncCount > 0 ? "critical" : "default",
      },
      {
        label: copy.validPunches24h,
        value: snapshot.validPunchCount24h.toLocaleString("en-US"),
        tone: "default",
      },
      {
        label: copy.pendingValidation,
        value: snapshot.pendingValidationCount.toLocaleString("en-US"),
        tone: snapshot.pendingValidationCount > 0 ? "attention" : "default",
      },
    ],
  });
}
