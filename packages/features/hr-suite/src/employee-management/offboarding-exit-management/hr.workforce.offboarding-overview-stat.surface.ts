import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { HrOffboardingOverviewSnapshot } from "@afenda/db";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrOffboardingUiCopy } from "./hr.workforce.offboarding-ui.copy.shared";

export const hrOffboardingOverviewStatSurfaceKey =
  "hr.workforce.offboarding.overview.stats";

function formatCount(count: number, label: string): string {
  return `${count.toLocaleString("en-US")} ${label}`;
}

function buildStatGrid(
  stats: StatCardConfigurationResolvedInput["stats"],
): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats,
  });
}

export function buildHrOffboardingOverviewPostureStatGrid(input: {
  snapshot: HrOffboardingOverviewSnapshot;
}) {
  const { snapshot } = input;
  return buildStatGrid([
    {
      label: "In progress",
      value: formatCount(snapshot.inProgressCount, "active cases"),
      tone: snapshot.inProgressCount > 0 ? "attention" : "default",
    },
    {
      label: "Completed",
      value: formatCount(snapshot.completedCount, "closed"),
      tone: "default",
    },
  ]);
}

export function buildHrOffboardingOverviewClearanceStatGrid(input: {
  snapshot: HrOffboardingOverviewSnapshot;
}) {
  const { snapshot } = input;
  return buildStatGrid([
    {
      label: "Overdue tasks",
      value: formatCount(snapshot.overdueClearanceCount, "overdue"),
      tone: snapshot.overdueClearanceCount > 0 ? "critical" : "default",
    },
    {
      label: "Pending approvals",
      value: formatCount(snapshot.pendingApprovalCount, "pending"),
      tone: snapshot.pendingApprovalCount > 0 ? "attention" : "default",
    },
    {
      label: "Settlement ready",
      value: formatCount(snapshot.settlementReadyCount, "ready"),
      tone: "default",
    },
    {
      label: "Payroll blockers",
      value: formatCount(snapshot.blockedSettlementCount, "blocked"),
      tone: snapshot.blockedSettlementCount > 0 ? "attention" : "default",
    },
  ]);
}

export function buildHrOffboardingOverviewStatGroups(input: {
  snapshot: HrOffboardingOverviewSnapshot;
}) {
  return [
    {
      groupKey: "posture",
      label: hrOffboardingUiCopy.overview.postureTitle,
      configuration: buildHrOffboardingOverviewPostureStatGrid(input),
    },
    {
      groupKey: "clearance",
      label: hrOffboardingUiCopy.overview.clearanceTitle,
      configuration: buildHrOffboardingOverviewClearanceStatGrid(input),
    },
  ] as const;
}
