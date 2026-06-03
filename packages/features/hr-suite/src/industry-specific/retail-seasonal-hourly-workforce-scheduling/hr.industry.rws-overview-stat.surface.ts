import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrIndustryRwsUiCopy } from "./hr.industry.rws-ui.copy.shared";

export type HrIndustryRwsOverviewSnapshot = {
  readonly scheduleCount: number;
  readonly assignmentCount: number;
  readonly coverageGapCount: number;
  readonly overBudgetScheduleCount: number;
  readonly overtimeRiskCount: number;
  readonly complianceFindingCount: number;
};

export function buildHrIndustryRwsOverviewStatGrid(input: {
  readonly snapshot: HrIndustryRwsOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrIndustryRwsUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.schedules,
        value: String(snapshot.scheduleCount),
        tone: "default",
      },
      {
        label: copy.assignments,
        value: String(snapshot.assignmentCount),
        tone: "default",
      },
      {
        label: copy.coverageGaps,
        value: String(snapshot.coverageGapCount),
        tone: snapshot.coverageGapCount > 0 ? "critical" : "positive",
      },
      {
        label: copy.overBudget,
        value: String(snapshot.overBudgetScheduleCount),
        tone: snapshot.overBudgetScheduleCount > 0 ? "critical" : "positive",
      },
      {
        label: copy.overtimeRisks,
        value: String(snapshot.overtimeRiskCount),
        tone: snapshot.overtimeRiskCount > 0 ? "attention" : "positive",
      },
      {
        label: copy.complianceFindings,
        value: String(snapshot.complianceFindingCount),
        tone: snapshot.complianceFindingCount > 0 ? "attention" : "positive",
      },
    ],
  });
}
