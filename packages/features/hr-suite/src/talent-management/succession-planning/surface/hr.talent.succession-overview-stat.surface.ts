import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrSuccessionUiCopy } from "./hr.talent.succession-ui.copy.shared";

export type HrSuccessionOverviewSnapshot = {
  criticalRoleCount: number;
  readyNowCount: number;
  weakCoverageCount: number;
  noReadySuccessorCount: number;
  highRiskCount: number;
  overdueReviewCount: number;
};

export function buildHrSuccessionOverviewStatGrid(input: {
  snapshot: HrSuccessionOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrSuccessionUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.criticalRoles,
        value: String(snapshot.criticalRoleCount),
        tone: "default",
      },
      {
        label: copy.readyNow,
        value: String(snapshot.readyNowCount),
        tone: snapshot.readyNowCount > 0 ? "default" : "attention",
      },
      {
        label: copy.weakCoverage,
        value: String(snapshot.weakCoverageCount),
        tone: snapshot.weakCoverageCount > 0 ? "attention" : "default",
      },
      {
        label: copy.noReady,
        value: String(snapshot.noReadySuccessorCount),
        tone: snapshot.noReadySuccessorCount > 0 ? "critical" : "default",
      },
      {
        label: copy.highRisk,
        value: String(snapshot.highRiskCount),
        tone: snapshot.highRiskCount > 0 ? "critical" : "default",
      },
      {
        label: copy.overdueReviews,
        value: String(snapshot.overdueReviewCount),
        tone: snapshot.overdueReviewCount > 0 ? "attention" : "default",
      },
    ],
  });
}
