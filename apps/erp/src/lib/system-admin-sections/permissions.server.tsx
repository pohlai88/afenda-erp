import { systemAdminPermissionsUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminPermissionsPageModel,
  requireSystemAdminPermissionsRead,
  setRoleOverrideAction,
  SystemAdminPermissionsAccessDenied,
  SystemAdminPermissionsSection,
} from "@afenda/feature-system-admin/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permissions — System admin",
  description: systemAdminPermissionsUiCopy.page.description,
};

export default async function SystemAdminPermissionsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let organization: Awaited<
    ReturnType<typeof requireSystemAdminPermissionsRead>
  >["organization"];
  let context: Awaited<
    ReturnType<typeof requireSystemAdminPermissionsRead>
  >["context"];

  try {
    ({ organization, context } = await requireSystemAdminPermissionsRead());
  } catch {
    return <SystemAdminPermissionsAccessDenied />;
  }

  const canManage =
    hasExecutionPermission(context, "system-admin.permissions.manage") ||
    hasExecutionPermission(context, "system-admin.identity.write");
  const {
    searchValue,
    coverageFilter,
    permissions,
    missingPermissionCount,
    roleOverrides,
  } = await buildSystemAdminPermissionsPageModel({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
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
