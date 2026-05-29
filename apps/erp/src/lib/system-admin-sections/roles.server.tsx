import {
  buildRolesListSurface,
  systemAdminRolesSurfaceKey,
  systemAdminRolesUiCopy,
} from "@afenda/feature-system-admin/metadata";
import {
  assignSystemAdminRole,
  buildSystemAdminRolesPageModel,
  deprecateSystemAdminRoleForm,
  reactivateSystemAdminRoleForm,
  requireSystemAdminRolesRead,
  SystemAdminRolesAccessDenied,
  updateSystemAdminRoleForm,
} from "@afenda/feature-system-admin/server";
import {
  SystemAdminAssignRoleDialog,
  SystemAdminRoleCatalogEditor,
} from "@afenda/feature-system-admin/client";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles — System admin",
  description: systemAdminRolesUiCopy.page.description,
};

export default async function SystemAdminRolesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let organization: Awaited<
    ReturnType<typeof requireSystemAdminRolesRead>
  >["organization"];
  let context: Awaited<ReturnType<typeof requireSystemAdminRolesRead>>["context"];

  try {
    ({ organization, context } = await requireSystemAdminRolesRead());
  } catch {
    return <SystemAdminRolesAccessDenied />;
  }

  const canMutate = hasExecutionPermission(context, "system-admin.roles.manage");

  const { searchValue, roles } = await buildSystemAdminRolesPageModel({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    searchParams: resolvedSearchParams,
  });

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={systemAdminRolesUiCopy.page.title}
        description={systemAdminRolesUiCopy.page.description}
      />

      <GovernedPatternCListSection
        title={systemAdminRolesUiCopy.list.title}
        surfaceKey={systemAdminRolesSurfaceKey}
        listConfiguration={buildRolesListSurface({ roles, searchValue })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate ? (
        <>
          <SectionPanel
            title="Role catalog"
            description="Edit tenant-facing role labels and deprecate seeded roles. Custom role keys still require platform enum extension."
          >
            <SystemAdminRoleCatalogEditor
              updateRoleAction={updateSystemAdminRoleForm}
              deprecateRoleAction={deprecateSystemAdminRoleForm}
              reactivateRoleAction={reactivateSystemAdminRoleForm}
            />
          </SectionPanel>

          <SectionPanel
            title="Assign role"
            description="Updates the membership primary role. Deprecated catalog roles cannot be assigned."
          >
            <SystemAdminAssignRoleDialog assignRoleAction={assignSystemAdminRole} />
          </SectionPanel>
        </>
      ) : null}
    </div>
  );
}
