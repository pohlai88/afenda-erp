import {
  listRoleOverridesForOrganization,
  requireSystemAdminUsersRead,
  SystemAdminIdentityHub,
} from "@afenda/feature-system-admin/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identity — System admin",
  description:
    "Tenant role overrides and cross-links to user lifecycle, membership, and permission surfaces.",
};

export default async function SystemAdminIdentityPage() {
  const { context, organization } = await requireSystemAdminUsersRead();
  const canManageUsers = hasExecutionPermission(context, "system-admin.users.manage");
  const canWriteOverrides =
    hasExecutionPermission(context, "system-admin.identity.write") ||
    canManageUsers ||
    hasExecutionPermission(context, "system-admin.roles.manage") ||
    hasExecutionPermission(context, "system-admin.permissions.manage");
  const canInviteViaIdentity =
    !canManageUsers &&
    hasExecutionPermission(context, "system-admin.identity.write");

  const overrides = await listRoleOverridesForOrganization({
    organizationId: organization.id,
    limit: 200,
  });

  return (
    <SystemAdminIdentityHub
      overrides={overrides}
      canWriteOverrides={canWriteOverrides}
      canInviteViaIdentity={canInviteViaIdentity}
    />
  );
}
