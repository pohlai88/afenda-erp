import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { HrComplianceOverviewSnapshot } from "@afenda/db";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

export const hrComplianceOverviewStatSurfaceKey =
  "hr.workforce.compliance.overview.stats";

function formatSnapshotCount(count: number, label: string): string {
  return `${count.toLocaleString("en-US")} ${label}`;
}

function buildOverviewStatGridBase(
  stats: StatCardConfigurationResolvedInput["stats"],
): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats,
  });
}

/** Requirement and exception posture — max 6 tiles per governed stat-card group. */
export function buildHrComplianceOverviewRiskStatGrid(input: {
  snapshot: HrComplianceOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const { snapshot } = input;

  return buildOverviewStatGridBase([
    {
      label: "At-risk requirements",
      value: formatSnapshotCount(snapshot.atRiskRequirementCount, "at risk"),
      tone: snapshot.atRiskRequirementCount > 0 ? "attention" : "default",
    },
    {
      label: "Overdue requirements",
      value: formatSnapshotCount(snapshot.overdueRequirementCount, "overdue"),
      tone: snapshot.overdueRequirementCount > 0 ? "critical" : "default",
    },
    {
      label: "Open exceptions",
      value: formatSnapshotCount(snapshot.openExceptionCount, "open"),
      tone: snapshot.openExceptionCount > 0 ? "attention" : "default",
    },
    {
      label: "Critical alerts",
      value: formatSnapshotCount(snapshot.criticalAlertCount, "critical"),
      tone: snapshot.criticalAlertCount > 0 ? "critical" : "default",
    },
  ]);
}

/** Filing and review follow-up — separate group to stay within the 6-tile cap. */
export function buildHrComplianceOverviewFollowUpStatGrid(input: {
  snapshot: HrComplianceOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const { snapshot } = input;

  return buildOverviewStatGridBase([
    {
      label: "Overdue filings",
      value: formatSnapshotCount(snapshot.overdueFilingCount, "overdue"),
      tone: snapshot.overdueFilingCount > 0 ? "critical" : "default",
    },
    {
      label: "Pending reviews",
      value: formatSnapshotCount(snapshot.pendingReviewCount, "pending"),
      tone: snapshot.pendingReviewCount > 0 ? "attention" : "default",
    },
  ]);
}

export function buildHrComplianceOverviewStatGroups(input: {
  snapshot: HrComplianceOverviewSnapshot;
}) {
  return [
    {
      groupKey: "risk",
      label: "Risk posture",
      configuration: buildHrComplianceOverviewRiskStatGrid(input),
    },
    {
      groupKey: "follow-up",
      label: "Operational follow-up",
      configuration: buildHrComplianceOverviewFollowUpStatGrid(input),
    },
  ] as const;
}
