import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { HrEmployeeRecordsOverviewSnapshot } from "@afenda/db";

export const hrRecordsOverviewStatSurfaceKey =
  "hr.workforce.records.overview.stats";

function formatCount(count: number, label: string): string {
  return `${count.toLocaleString("en-US")} ${label}`;
}

export function buildHrRecordsOverviewStatGrid(input: {
  snapshot: HrEmployeeRecordsOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: "Active roster",
        value: formatCount(snapshot.activeRosterCount, "employees"),
        tone: "default",
      },
      {
        label: "Incomplete profiles",
        value: formatCount(snapshot.incompleteProfileCount, "incomplete"),
        tone: snapshot.incompleteProfileCount > 0 ? "attention" : "default",
      },
      {
        label: "Separated",
        value: formatCount(snapshot.separatedCount, "historical"),
        tone: "default",
      },
      {
        label: "Assignment rows",
        value: formatCount(snapshot.assignmentHistoryCount, "recorded"),
        tone: "default",
      },
    ],
  });
}

export function buildHrRecordsOverviewStatGroups(input: {
  snapshot: HrEmployeeRecordsOverviewSnapshot;
}) {
  return [
    {
      groupKey: "posture",
      label: "Workforce posture",
      configuration: buildHrRecordsOverviewStatGrid(input),
    },
  ] as const;
}
