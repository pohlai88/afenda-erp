import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrTalentEngUiCopy } from "./hr.talent.eng-ui.copy.shared";

export type HrTalentEngOverviewSnapshot = {
  readonly activeSurveyCount: number;
  readonly averageResponseRate: number;
  readonly lowRiskSignalCount: number;
  readonly openActionCount: number;
};

function formatPercent(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

export function buildHrTalentEngOverviewStatGrid(input: {
  readonly snapshot: HrTalentEngOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrTalentEngUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.activeSurveys,
        value: String(snapshot.activeSurveyCount),
        tone: snapshot.activeSurveyCount > 0 ? "positive" : "default",
      },
      {
        label: copy.responseRate,
        value: formatPercent(snapshot.averageResponseRate),
        tone: snapshot.averageResponseRate >= 60 ? "positive" : "attention",
      },
      {
        label: copy.lowRiskSegments,
        value: String(snapshot.lowRiskSignalCount),
        tone: snapshot.lowRiskSignalCount > 0 ? "attention" : "positive",
      },
      {
        label: copy.openActions,
        value: String(snapshot.openActionCount),
        tone: snapshot.openActionCount > 0 ? "attention" : "positive",
      },
    ],
  });
}
