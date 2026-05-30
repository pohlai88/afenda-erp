import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { HrLifecycleOverviewSnapshot } from "../data/hr.workforce.lifecycle-overview.shared";

export const hrLifecycleOverviewStatSurfaceKey =
  "hr.workforce.lifecycle.overview.stats";

function formatCount(count: number, label: string): string {
  return `${count.toLocaleString("en-US")} ${label}`;
}

export function buildHrLifecycleOverviewStatGrid(input: {
  snapshot: HrLifecycleOverviewSnapshot;
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
        label: "On probation",
        value: formatCount(snapshot.probationCount, "on probation"),
        tone: snapshot.probationCount > 0 ? "attention" : "default",
      },
      {
        label: "Onboarding",
        value: formatCount(snapshot.onboardingCount, "onboarding"),
        tone: snapshot.onboardingCount > 0 ? "attention" : "default",
      },
      {
        label: "Pending transitions",
        value: formatCount(snapshot.pendingTransitionCount, "scheduled"),
        tone: snapshot.pendingTransitionCount > 0 ? "attention" : "default",
      },
      {
        label: "Notice period",
        value: formatCount(snapshot.noticePeriodCount, "in notice"),
        tone: snapshot.noticePeriodCount > 0 ? "attention" : "default",
      },
      {
        label: "Onboarding cases",
        value: formatCount(snapshot.onboardingCasesCount, "active cases"),
        tone: snapshot.onboardingCasesCount > 0 ? "attention" : "default",
      },
      {
        label: "Offboarding cases",
        value: formatCount(snapshot.offboardingCasesCount, "active cases"),
        tone: snapshot.offboardingCasesCount > 0 ? "attention" : "default",
      },
    ],
  });
}

export function buildHrLifecycleOverviewStatGroups(input: {
  snapshot: HrLifecycleOverviewSnapshot;
}) {
  return [
    {
      groupKey: "posture",
      label: "Lifecycle posture",
      configuration: buildHrLifecycleOverviewStatGrid(input),
    },
  ] as const;
}
