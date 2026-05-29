import { systemAdminUsersUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  listRoleOverridesForOrganization,
  requireSystemAdminUsersRead,
  SystemAdminIdentityAccessDenied,
  SystemAdminIdentityHub,
} from "@afenda/feature-system-admin/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identity — System admin",
  description: systemAdminUsersUiCopy.identity.page.description,
};

export default async function SystemAdminIdentityPage() {
  let organization: Awaited<
    ReturnType<typeof requireSystemAdminUsersRead>
  >["organization"];
  let context: Awaited<
    ReturnType<typeof requireSystemAdminUsersRead>
  >["context"];

  try {
    ({ context, organization } = await requireSystemAdminUsersRead());
  } catch {
    return <SystemAdminIdentityAccessDenied />;
  }

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
