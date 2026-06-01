import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrTalentTrainingUiCopy } from "./hr.talent.training-ui.copy.shared";

export type HrTrainingOverviewSnapshot = {
  readonly activeCourseCount: number;
  readonly pendingApprovalCount: number;
  readonly waitlistedCount: number;
  readonly certificationRiskCount: number;
  readonly openSkillGapCount: number;
  readonly spendAmount: number;
};

export function buildHrTrainingOverviewStatGrid(input: {
  readonly snapshot: HrTrainingOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrTalentTrainingUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.activeCourses,
        value: String(snapshot.activeCourseCount),
        tone: "default",
      },
      {
        label: copy.pendingApprovals,
        value: String(snapshot.pendingApprovalCount),
        tone: snapshot.pendingApprovalCount > 0 ? "attention" : "default",
      },
      {
        label: copy.waitlisted,
        value: String(snapshot.waitlistedCount),
        tone: snapshot.waitlistedCount > 0 ? "attention" : "default",
      },
      {
        label: copy.certificationRisk,
        value: String(snapshot.certificationRiskCount),
        tone: snapshot.certificationRiskCount > 0 ? "critical" : "default",
      },
      {
        label: copy.openSkillGaps,
        value: String(snapshot.openSkillGapCount),
        tone: snapshot.openSkillGapCount > 0 ? "attention" : "default",
      },
      {
        label: copy.spend,
        value: `MYR ${snapshot.spendAmount.toLocaleString("en-MY")}`,
        tone: "default",
      },
    ],
  });
}

export const buildHrTalentTrainingOverviewStatGrid =
  buildHrTrainingOverviewStatGrid;
