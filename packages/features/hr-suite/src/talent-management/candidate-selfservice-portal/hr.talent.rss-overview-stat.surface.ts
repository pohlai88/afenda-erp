import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrTalentRssUiCopy } from "./hr.talent.rss-ui.copy.shared";

export type HrTalentRssOverviewSnapshot = {
  readonly candidateCount: number;
  readonly activeApplicationsCount: number;
  readonly pendingTasksCount: number;
  readonly privacyActionsCount: number;
};

export function buildHrTalentRssOverviewStatGrid(input: {
  readonly snapshot: HrTalentRssOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrTalentRssUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.candidates,
        value: String(snapshot.candidateCount),
        tone: "default",
      },
      {
        label: copy.activeApplications,
        value: String(snapshot.activeApplicationsCount),
        tone: "positive",
      },
      {
        label: copy.pendingTasks,
        value: String(snapshot.pendingTasksCount),
        tone: snapshot.pendingTasksCount > 0 ? "attention" : "positive",
      },
      {
        label: copy.privacyActions,
        value: String(snapshot.privacyActionsCount),
        tone: snapshot.privacyActionsCount > 0 ? "attention" : "positive",
      },
    ],
  });
}
