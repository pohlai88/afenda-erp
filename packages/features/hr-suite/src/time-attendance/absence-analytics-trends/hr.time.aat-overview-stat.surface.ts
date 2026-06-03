import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrAatUiCopy } from "./hr.time.aat-ui.copy.shared";
import {
  hrAatOverviewStatSurfaceKey,
} from "./hr.time.aat-surface-metadata.shared";

export { hrAatOverviewStatSurfaceKey };

function buildStatGrid(
  stats: StatCardConfigurationResolvedInput["stats"],
): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats,
  });
}

export function buildHrAatOverviewStatGrid(input: {
  absenceRatePercent: number;
  totalLostWorkdays: number;
  atRiskEmployeeCount: number;
  snapshotCount: number;
}) {
  return buildStatGrid([
    {
      label: hrAatUiCopy.overview.absenceRateLabel,
      value: `${input.absenceRatePercent.toFixed(1)}%`,
      tone: input.absenceRatePercent >= 10 ? "attention" : "default",
    },
    {
      label: hrAatUiCopy.overview.lostWorkdaysLabel,
      value: input.totalLostWorkdays.toLocaleString("en-US"),
      tone: "default",
    },
    {
      label: hrAatUiCopy.overview.atRiskEmployeesLabel,
      value: input.atRiskEmployeeCount.toLocaleString("en-US"),
      tone: input.atRiskEmployeeCount > 0 ? "critical" : "default",
    },
    {
      label: hrAatUiCopy.overview.snapshotsLabel,
      value: input.snapshotCount.toLocaleString("en-US"),
      tone: "default",
    },
  ]);
}
