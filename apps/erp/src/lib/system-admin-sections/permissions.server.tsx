import {
  buildPermissionsListSurface,
  buildRoleOverridesListSurface,
  systemAdminPermissionsSurfaceKey,
  systemAdminRoleOverridesSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminPermissionsPageModel,
  requireSystemAdminPermissionsRead,
  setRoleOverrideAction,
  SystemAdminPermissionsAccessDenied,
} from "@afenda/feature-system-admin/server";
import { RoleOverrideForm } from "@afenda/feature-system-admin/client";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { Alert, AlertDescription, SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permissions — System admin",
  description: "Declared permission catalog and coverage matrix.",
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
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title="Permissions"
        description="Permissions are declared capability contracts grouped by module and action. Coverage verdicts flag orphan, unassigned, missing capability, and overprivileged grants."
      />

      {missingPermissionCount > 0 ? (
        <Alert variant="destructive">
          <AlertDescription>
            {missingPermissionCount} execution capability reference
            {missingPermissionCount === 1 ? "s" : ""} permission keys that are
            not registered in the declared catalog. Review the coverage column
            and reconcile the catalog before granting new role bundles.
          </AlertDescription>
        </Alert>
      ) : null}

      <GovernedPatternCListSection
        title="Permission catalog"
        surfaceKey={systemAdminPermissionsSurfaceKey}
        listConfiguration={buildPermissionsListSurface({
          searchValue,
          coverageFilter,
          permissions,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title="Role permission overrides"
        description="Tenant overrides apply on top of the static role catalog when sessions are refreshed."
        surfaceKey={systemAdminRoleOverridesSurfaceKey}
        listConfiguration={buildRoleOverridesListSurface({
          overrides: roleOverrides,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      {canManage ? (
        <SectionPanel
          title="Update role permission bundle"
          description="Permissions are assigned through roles. High-risk and critical grants require explicit confirmation."
        >
          <RoleOverrideForm setRoleOverrideAction={setRoleOverrideAction} />
        </SectionPanel>
      ) : null}
    </div>
  );
}
