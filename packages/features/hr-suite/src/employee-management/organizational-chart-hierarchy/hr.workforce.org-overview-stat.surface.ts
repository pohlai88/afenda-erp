import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { HrOrgOverviewSnapshot } from "@afenda/db";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

export const hrOrgOverviewStatSurfaceKey = "hr.workforce.org.overview.stats";

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

export function buildHrOrgOverviewStructureStatGrid(input: {
  snapshot: HrOrgOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const { snapshot } = input;

  return buildOverviewStatGridBase([
    {
      label: "Organization units",
      value: formatSnapshotCount(snapshot.orgUnitCount, "units"),
      tone: "default",
    },
    {
      label: "Planned units",
      value: formatSnapshotCount(snapshot.plannedOrgUnitCount, "planned"),
      tone: snapshot.plannedOrgUnitCount > 0 ? "attention" : "default",
    },
  ]);
}

export function buildHrOrgOverviewHeadcountStatGrid(input: {
  snapshot: HrOrgOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const { snapshot } = input;

  return buildOverviewStatGridBase([
    {
      label: "Active employees",
      value: formatSnapshotCount(snapshot.activeEmployeeCount, "employees"),
      tone: "default",
    },
    {
      label: "Vacant positions",
      value: formatSnapshotCount(snapshot.vacantPositionCount, "vacant"),
      tone: snapshot.vacantPositionCount > 0 ? "attention" : "default",
    },
  ]);
}

export function buildHrOrgOverviewStatGroups(input: {
  snapshot: HrOrgOverviewSnapshot;
}) {
  return [
    {
      groupKey: "structure",
      label: "Structure posture",
      configuration: buildHrOrgOverviewStructureStatGrid(input),
    },
    {
      groupKey: "headcount",
      label: "Headcount and vacancies",
      configuration: buildHrOrgOverviewHeadcountStatGrid(input),
    },
  ] as const;
}
