import {
  listAuditLogsForOrganization,
  listOrganizationInvitations,
  listTenantMembers,
} from "@afenda/db";
import { getAiSandboxesSummary } from "./system-admin.machine-layer.query.server";

export type HubGovernanceSnapshot = {
  memberCount: number;
  pendingInviteCount: number;
  recentAuditEventCount: number;
  pendingSandboxCount: number;
};

export async function getHubGovernanceSnapshot(input: {
  organizationId: string;
}): Promise<HubGovernanceSnapshot> {
  const [members, invitations, auditLogs, sandboxes] = await Promise.all([
    listTenantMembers({ organizationId: input.organizationId, limit: 100 }),
    listOrganizationInvitations({
      organizationId: input.organizationId,
      limit: 100,
    }),
    listAuditLogsForOrganization({
      organizationId: input.organizationId,
      limit: 5,
    }),
    getAiSandboxesSummary({ organizationId: input.organizationId, limit: 50 }),
  ]);

  return {
    memberCount: members.length,
    pendingInviteCount: invitations.filter(
      (invitation) => invitation.status === "pending",
    ).length,
    recentAuditEventCount: auditLogs.length,
    pendingSandboxCount: sandboxes.filter(
      (sandbox) => sandbox.status === "pending",
    ).length,
  };
}
