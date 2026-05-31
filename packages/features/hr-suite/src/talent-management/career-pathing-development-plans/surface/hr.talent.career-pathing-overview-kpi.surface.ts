import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrCareerPathingOverviewKpiSurfaceKey } from "./hr.talent.career-pathing-surface-metadata.shared";
import { hrTalentCareerPathingUiCopy } from "./hr.talent.career-pathing-ui.copy.shared";

export { hrCareerPathingOverviewKpiSurfaceKey };

export type HrCareerPathingOverviewSnapshot = {
  frameworkCount: number;
  targetRoleCount: number;
  activePlanCount: number;
  overdueMilestoneCount: number;
  nearReadyCount: number;
};

export function buildHrCareerPathingOverviewStatGrid(input: {
  snapshot: HrCareerPathingOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrTalentCareerPathingUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      { label: copy.frameworks, value: String(snapshot.frameworkCount), tone: "default" },
      { label: copy.targetRoles, value: String(snapshot.targetRoleCount), tone: "default" },
      { label: copy.activePlans, value: String(snapshot.activePlanCount), tone: "default" },
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

/** @deprecated Use `buildHrCareerPathingOverviewStatGrid`. */
export const buildHrCareerPathOverviewStatGrid = buildHrCareerPathingOverviewStatGrid;
