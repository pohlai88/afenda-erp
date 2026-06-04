import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";

import { updateSystemAdminCapabilitySettingsAction } from "./sys-capability-settings.actions.server";
import { buildSystemAdminCapabilitiesPageModel } from "./sys-capabilities.page-model.server";
import { requireSystemAdminCapabilitiesRead } from "./sys-capabilities.policy.server";
import { buildCapabilitiesListSurface, systemAdminCapabilitiesSurfaceKey } from "./sys-capabilities-list.surface";
import { buildCapabilityRoleMatrixListSurface, systemAdminCapabilityRoleMatrixSurfaceKey } from "./sys-capabilities-role-matrix.surface";
import { systemAdminCapabilitiesUiCopy } from "./sys-capabilities-ui.copy.shared";
import { SystemAdminCapabilitiesAccessDenied } from "./sys-capabilities-access.component.server";
import { SystemAdminCapabilityTrailingCell } from "./sys-capabilities-trailing-cells.component.client";
import { SystemAdminCapabilitySettingsDialog } from "./sys-capability-settings-dialog.component.client";

type SystemAdminCapabilitiesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function SystemAdminCapabilitiesPage({
  searchParams,
}: SystemAdminCapabilitiesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireSystemAdminCapabilitiesRead>>;

  try {
    guard = await requireSystemAdminCapabilitiesRead();
  } catch {
    return (
      <div
        data-testid="system-admin-capabilities-access-denied"
        className="contents"
      >
        <SystemAdminCapabilitiesAccessDenied />
      </div>
    );
  }

  const canMutate = hasExecutionPermission(
    guard.context,
    "system-admin.capabilities.manage",
  );
  const { searchValue, capabilities, capabilityOptions, roleMatrix, matrixRole } =
    await buildSystemAdminCapabilitiesPageModel({
      organizationId: guard.organization.id,
      searchParams: resolvedSearchParams,
    });

  return (
    <div data-testid="system-admin-capabilities-page" className="contents">
      <div className="@container flex flex-col gap-surface-2xl">
        <SectionPanel
          headingLevel={2}
          title={systemAdminCapabilitiesUiCopy.page.title}
          description={systemAdminCapabilitiesUiCopy.page.description}
        />

        <div data-testid="system-admin-capabilities-catalog" className="contents">
          <GovernedPatternCListSection
            title={systemAdminCapabilitiesUiCopy.list.title}
            surfaceKey={systemAdminCapabilitiesSurfaceKey}
            listConfiguration={buildCapabilitiesListSurface({
              searchValue,
              capabilities,
              canMutate,
            })}
            parentAccessAllowed
            layout="embedded"
            trailingColumn={{
              header: "Actions",
              Cell: SystemAdminCapabilityTrailingCell,
            }}
          />
        </div>

        <div
          data-testid="system-admin-capabilities-role-matrix"
          className="contents"
        >
          <GovernedPatternCListSection
            title={systemAdminCapabilitiesUiCopy.roleMatrix.title}
            surfaceKey={systemAdminCapabilityRoleMatrixSurfaceKey}
            listConfiguration={buildCapabilityRoleMatrixListSurface({
              rows: roleMatrix,
              roleFilter: matrixRole,
            })}
            parentAccessAllowed
            layout="embedded"
          />
        </div>

        {canMutate ? (
          <div data-testid="system-admin-capabilities-settings" className="contents">
            <SectionPanel
              title={systemAdminCapabilitiesUiCopy.settings.title}
              description={systemAdminCapabilitiesUiCopy.settings.description}
            >
              <SystemAdminCapabilitySettingsDialog
                updateCapabilitySettingsAction={
                  updateSystemAdminCapabilitySettingsAction
                }
                capabilityOptions={capabilityOptions}
              />
            </SectionPanel>
          </div>
        ) : null}
      </div>
    </div>
  );
}
