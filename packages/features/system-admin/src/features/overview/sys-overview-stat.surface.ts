import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { SystemAdminOverviewSnapshot } from "../contracts";

export const systemAdminOverviewStatSurfaceKey = "system-admin-overview-stats";

export function buildSystemAdminOverviewStatGrid(input: {
  snapshot: SystemAdminOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      { label: "Users", value: String(snapshot.userCount), tone: "default" },
      {
        label: "Pending invites",
        value: String(snapshot.pendingInviteCount),
        tone: snapshot.pendingInviteCount > 0 ? "attention" : "default",
      },
      {
        label: "Active memberships",
        value: String(snapshot.activeMembershipCount),
        tone: "positive",
      },
      { label: "Roles", value: String(snapshot.roleCount), tone: "default" },
      {
        label: "Active policy rules",
        value: String(snapshot.activePolicyRuleCount),
        tone: "default",
      },
      {
        label: "Active approval rules",
        value: String(snapshot.activeApprovalRuleCount),
        tone: "default",
      },
      {
        label: "Recent admin changes",
        value: String(snapshot.recentAdminChangeCount),
        tone: snapshot.recentAdminChangeCount > 0 ? "attention" : "default",
      },
    ],
  });
}
