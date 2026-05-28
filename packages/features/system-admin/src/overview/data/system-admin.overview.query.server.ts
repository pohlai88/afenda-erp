import { listAuditLogsForOrganization, listOrganizationInvitations } from "@afenda/db";
import { loadTenantExecutionRulesForOrganization } from "../../execution/tenant-execution-rules.loader.server";
import { listSystemAdminMemberships } from "../../memberships/data";
import { listSystemAdminRoles } from "../../roles/data";
import { listSystemAdminUsers } from "../../users/data";
import type { SystemAdminOverviewSnapshot } from "../contracts";

function isSystemAdminAuditAction(action: string) {
  return action.startsWith("system-admin.") || action.startsWith("tenant.");
}

export async function getSystemAdminOverview(input: {
  organizationId: string;
}): Promise<SystemAdminOverviewSnapshot> {
  const [users, invitations, memberships, roles, auditLogs, executionRules] =
    await Promise.all([
      listSystemAdminUsers({ organizationId: input.organizationId, limit: 200 }),
      listOrganizationInvitations({
        organizationId: input.organizationId,
        limit: 200,
      }),
      listSystemAdminMemberships({
        organizationId: input.organizationId,
        limit: 200,
      }),
      listSystemAdminRoles({ organizationId: input.organizationId }),
      listAuditLogsForOrganization({
        organizationId: input.organizationId,
        limit: 20,
      }),
      loadTenantExecutionRulesForOrganization(input.organizationId),
    ]);
  const recentAdminChanges = auditLogs.filter((log) =>
    isSystemAdminAuditAction(log.action),
  );

  return {
    userCount: users.length,
    pendingInviteCount: invitations.filter(
      (invitation) => invitation.status === "pending",
    ).length,
    activeMembershipCount: memberships.filter(
      (membership) => membership.status === "active",
    ).length,
    roleCount: roles.length,
    activePolicyRuleCount: executionRules.policyRules.length,
    activeApprovalRuleCount: executionRules.approvalRules.length,
    recentAdminChangeCount: recentAdminChanges.length,
    recentAdminChanges: recentAdminChanges.slice(0, 5).map((log) => ({
      id: log.id,
      action: log.action,
      summary: log.summary,
      createdAt: log.createdAt,
    })),
  };
}
