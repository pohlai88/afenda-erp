import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrGeoUiCopy } from "./hr.time.geo-ui.copy.shared";

export function buildHrGeoOverviewStatGrid(input: {
  verifiedToday: number;
  pendingExceptions: number;
  outsideGeofenceFlags: number;
  weakGpsFlags: number;
}): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: hrGeoUiCopy.stats.verifiedToday,
        value: `${input.verifiedToday.toLocaleString("en-US")} today`,
        tone: "default",
      },
      {
        label: hrGeoUiCopy.stats.pendingExceptions,
        value: `${input.pendingExceptions.toLocaleString("en-US")} pending`,
        tone: input.pendingExceptions > 0 ? "attention" : "default",
      },
      {
        label: hrGeoUiCopy.stats.outsideGeofence,
        value: `${input.outsideGeofenceFlags.toLocaleString("en-US")} flags`,
        tone: input.outsideGeofenceFlags > 0 ? "critical" : "default",
      },
      {
        label: hrGeoUiCopy.stats.weakGps,
        value: `${input.weakGpsFlags.toLocaleString("en-US")} flags`,
        tone: input.weakGpsFlags > 0 ? "attention" : "default",
      },
    ],
  });
}
