import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrCareerPathUiCopy } from "./hr.talent.career-pathing-ui.copy.shared";

export type HrCareerPathOverviewSnapshot = {
  frameworkCount: number;
  targetRoleCount: number;
  activePlanCount: number;
  overdueMilestoneCount: number;
  nearReadyCount: number;
};

export function buildHrCareerPathOverviewStatGrid(input: {
  snapshot: HrCareerPathOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrCareerPathUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.frameworks,
        value: String(snapshot.frameworkCount),
        tone: "default",
      },
      {
        label: copy.targetRoles,
        value: String(snapshot.targetRoleCount),
        tone: "default",
      },
      {
        label: copy.activePlans,
        value: String(snapshot.activePlanCount),
        tone: "default",
      },
      {
        label: copy.overdueMilestones,
        value: String(snapshot.overdueMilestoneCount),
        tone: snapshot.overdueMilestoneCount > 0 ? "attention" : "default",
      },
      {
        label: copy.nearReady,
        value: String(snapshot.nearReadyCount),
        tone: snapshot.nearReadyCount > 0 ? "default" : "default",
      },
    ],
  });
}
