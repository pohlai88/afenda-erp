import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { SystemAdminOverviewSnapshot } from "../contracts";

export const systemAdminOverviewStatSurfaceKey = "system-admin-overview-stats";

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

/** Identity counts — max 6 tiles per governed stat-card group. */
export function buildSystemAdminOverviewIdentityStatGrid(input: {
  snapshot: SystemAdminOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const { snapshot } = input;

  return buildOverviewStatGridBase([
    {
      label: "Users",
      value: formatSnapshotCount(snapshot.userCount, "users"),
      tone: "default",
    },
    {
      label: "Pending invites",
      value: formatSnapshotCount(snapshot.pendingInviteCount, "pending"),
      tone: snapshot.pendingInviteCount > 0 ? "attention" : "default",
    },
    {
      label: "Active memberships",
      value: formatSnapshotCount(snapshot.activeMembershipCount, "active"),
      tone: "positive",
    },
    {
      label: "Roles",
      value: formatSnapshotCount(snapshot.roleCount, "roles"),
      tone: "default",
    },
  ]);
}

/** Policy, approval, and audit activity — separate group to stay within the 6-tile cap. */
export function buildSystemAdminOverviewGovernanceStatGrid(input: {
  snapshot: SystemAdminOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const { snapshot } = input;

  return buildOverviewStatGridBase([
    {
      label: "Active policy rules",
      value: formatSnapshotCount(snapshot.activePolicyRuleCount, "active"),
      tone: "default",
    },
    {
      label: "Active approval rules",
      value: formatSnapshotCount(snapshot.activeApprovalRuleCount, "active"),
      tone: "default",
    },
    {
      label: "Recent admin changes",
      value: formatSnapshotCount(snapshot.recentAdminChangeCount, "changes"),
      tone: snapshot.recentAdminChangeCount > 0 ? "attention" : "default",
    },
  ]);
}

