import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrWorkforceEssUiCopy } from "./hr.workforce.ess-ui.copy.shared";

export type HrWorkforceEssOverviewSnapshot = {
  readonly employeeCount: number;
  readonly openRequestCount: number;
  readonly pendingTaskCount: number;
  readonly sensitiveEventCount: number;
};

export function buildHrWorkforceEssOverviewStatGrid(input: {
  readonly snapshot: HrWorkforceEssOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrWorkforceEssUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.employees,
        value: String(snapshot.employeeCount),
        tone: "default",
      },
      {
        label: copy.openRequests,
        value: String(snapshot.openRequestCount),
        tone: snapshot.openRequestCount > 0 ? "attention" : "positive",
      },
      {
        label: copy.pendingTasks,
        value: String(snapshot.pendingTaskCount),
        tone: snapshot.pendingTaskCount > 0 ? "attention" : "positive",
      },
      {
        label: copy.sensitiveEvents,
        value: String(snapshot.sensitiveEventCount),
        tone: snapshot.sensitiveEventCount > 0 ? "attention" : "default",
      },
    ],
  });
}
