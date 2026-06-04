import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";

import { assignSystemAdminRole, deprecateSystemAdminRoleForm, reactivateSystemAdminRoleForm, updateSystemAdminRoleForm } from "./sys-roles.actions.server";
import { buildSystemAdminRolesPageModel } from "./sys-roles.page-model.server";
import { requireSystemAdminRolesRead } from "./sys-roles.policy.server";
import { buildRolesListSurface, systemAdminRolesSurfaceKey } from "./sys-roles-list.surface";
import { systemAdminRolesUiCopy } from "./sys-roles-ui.copy.shared";
import { SystemAdminAssignRoleDialog } from "./sys-assign-role-dialog.component.client";
import { SystemAdminRoleCatalogEditor } from "./sys-role-catalog-editor.component.client";
import { SystemAdminRolesAccessDenied } from "./sys-roles-access.component.server";

type SystemAdminRolesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function SystemAdminRolesPage({
  searchParams,
}: SystemAdminRolesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireSystemAdminRolesRead>>;

  try {
    guard = await requireSystemAdminRolesRead();
  } catch {
    return <SystemAdminRolesAccessDenied />;
  }

  const canMutate = hasExecutionPermission(
    guard.context,
    "system-admin.roles.manage",
  );

  const { searchValue, roles } = await buildSystemAdminRolesPageModel({
    organizationId: guard.organization.id,
    actorId: guard.context.userId,
    actorType: guard.context.actorType,
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
