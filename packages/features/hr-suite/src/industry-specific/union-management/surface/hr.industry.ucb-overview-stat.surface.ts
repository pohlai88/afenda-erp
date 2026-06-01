import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrIndustryUcbUiCopy } from "./hr.industry.ucb-ui.copy.shared";

export type HrIndustryUcbOverviewSnapshot = {
  readonly unionCount: number;
  readonly agreementCount: number;
  readonly membershipCount: number;
  readonly grievanceCount: number;
  readonly conflictCount: number;
  readonly alertCount: number;
};

export function buildHrIndustryUcbOverviewStatGrid(input: {
  readonly snapshot: HrIndustryUcbOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrIndustryUcbUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.unions,
        value: String(snapshot.unionCount),
        tone: "default",
      },
      {
        label: copy.agreements,
        value: String(snapshot.agreementCount),
        tone: "default",
      },
      {
        label: copy.memberships,
        value: String(snapshot.membershipCount),
        tone: "default",
      },
      {
        label: copy.grievances,
        value: String(snapshot.grievanceCount),
        tone: snapshot.grievanceCount > 0 ? "attention" : "positive",
      },
      {
        label: copy.conflicts,
        value: String(snapshot.conflictCount),
        tone: snapshot.conflictCount > 0 ? "critical" : "positive",
      },
      {
        label: copy.alerts,
        value: String(snapshot.alertCount),
        tone: snapshot.alertCount > 0 ? "attention" : "positive",
      },
    ],
  });
}
