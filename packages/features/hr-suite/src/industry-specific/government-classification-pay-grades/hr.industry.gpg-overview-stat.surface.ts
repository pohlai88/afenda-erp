import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrIndustryGpgUiCopy } from "./hr.industry.gpg-ui.copy.shared";

export type HrIndustryGpgOverviewSnapshot = {
  readonly activeClassificationCount: number;
  readonly publishedSalaryTableCount: number;
  readonly validAssignmentCount: number;
  readonly blockedAssignmentCount: number;
  readonly eligibleStepCandidateCount: number;
  readonly pendingMovementCount: number;
};

export function buildHrIndustryGpgOverviewStatGrid(input: {
  readonly snapshot: HrIndustryGpgOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrIndustryGpgUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.activeClassifications,
        value: String(snapshot.activeClassificationCount),
        tone: "default",
      },
      {
        label: copy.publishedSalaryTables,
        value: String(snapshot.publishedSalaryTableCount),
        tone: "positive",
      },
      {
        label: copy.validAssignments,
        value: String(snapshot.validAssignmentCount),
        tone: "positive",
      },
      {
        label: copy.blockedAssignments,
        value: String(snapshot.blockedAssignmentCount),
        tone: snapshot.blockedAssignmentCount > 0 ? "critical" : "default",
      },
      {
        label: copy.stepEligible,
        value: String(snapshot.eligibleStepCandidateCount),
        tone: snapshot.eligibleStepCandidateCount > 0 ? "attention" : "default",
      },
      {
        label: copy.pendingMovements,
        value: String(snapshot.pendingMovementCount),
        tone: snapshot.pendingMovementCount > 0 ? "attention" : "default",
      },
    ],
  });
}
