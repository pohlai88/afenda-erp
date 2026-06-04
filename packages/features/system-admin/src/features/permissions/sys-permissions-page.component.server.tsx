import { hasExecutionPermission } from "@afenda/kernel/execution";

import { setRoleOverrideAction } from "./sys-permission-bundle.actions.server";
import { buildSystemAdminPermissionsPageModel } from "./sys-permissions.page-model.server";
import { requireSystemAdminPermissionsRead } from "./sys-permissions.policy.server";
import {
  SystemAdminPermissionsAccessDenied,
  SystemAdminPermissionsSection,
} from "./sys-permissions-section.component.server";

type SystemAdminPermissionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function SystemAdminPermissionsPage({
  searchParams,
}: SystemAdminPermissionsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireSystemAdminPermissionsRead>>;

  try {
    guard = await requireSystemAdminPermissionsRead();
  } catch {
    return <SystemAdminPermissionsAccessDenied />;
  }

  const canManage =
    hasExecutionPermission(guard.context, "system-admin.permissions.manage") ||
    hasExecutionPermission(guard.context, "system-admin.identity.write");
  const {
    searchValue,
    coverageFilter,
    permissions,
    missingPermissionCount,
    roleOverrides,
  } = await buildSystemAdminPermissionsPageModel({
    organizationId: guard.organization.id,
    actorId: guard.context.userId,
    actorType: guard.context.actorType,
    searchParams: resolvedSearchParams,
  });

  return (
    <SystemAdminPermissionsSection
      permissions={permissions}
      roleOverrides={roleOverrides}
      searchValue={searchValue}
      coverageFilter={coverageFilter}
      missingPermissionCount={missingPermissionCount}
      canManage={canManage}
      setRoleOverrideAction={setRoleOverrideAction}
    />
  );
}
