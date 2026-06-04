import { hasExecutionPermission } from "@afenda/kernel/execution";
import { listRoleOverridesForOrganization } from "./sys-identity.repository.server";
import { requireSystemAdminUsersRead } from "./sys-users.policy.server";
import {
  SystemAdminIdentityAccessDenied,
} from "./sys-identity-access.component.server";
import { SystemAdminIdentityHub } from "./sys-identity-hub.component.server";

const SYSTEM_ADMIN_IDENTITY_OVERRIDES_WINDOW_LIMIT = 200;

export async function SystemAdminIdentityPage() {
  let guard: Awaited<ReturnType<typeof requireSystemAdminUsersRead>>;

  try {
    guard = await requireSystemAdminUsersRead();
  } catch {
    return <SystemAdminIdentityAccessDenied />;
  }

  const { context, organization } = guard;
  const canManageUsers = hasExecutionPermission(
    context,
    "system-admin.users.manage",
  );
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
    limit: SYSTEM_ADMIN_IDENTITY_OVERRIDES_WINDOW_LIMIT,
  });

  return (
    <SystemAdminIdentityHub
      overrides={overrides}
      canWriteOverrides={canWriteOverrides}
      canInviteViaIdentity={canInviteViaIdentity}
    />
  );
}
