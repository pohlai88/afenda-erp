import {
  buildCapabilitiesListSurface,
  buildCapabilityRoleMatrixListSurface,
  systemAdminCapabilitiesSurfaceKey,
  systemAdminCapabilityRoleMatrixSurfaceKey,
  systemAdminCapabilitiesUiCopy,
} from "@afenda/feature-system-admin/metadata";
import {
  SystemAdminCapabilitySettingsDialog,
  SystemAdminCapabilityTrailingCell,
} from "@afenda/feature-system-admin/client";
import {
  buildSystemAdminCapabilitiesPageModel,
  requireSystemAdminCapabilitiesRead,
  SystemAdminCapabilitiesAccessDenied,
  updateSystemAdminCapabilitySettingsAction,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capabilities — System admin",
  description: systemAdminCapabilitiesUiCopy.page.description,
};

export default async function SystemAdminCapabilitiesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let organization: Awaited<
    ReturnType<typeof requireSystemAdminCapabilitiesRead>
  >["organization"];
  let context: Awaited<
    ReturnType<typeof requireSystemAdminCapabilitiesRead>
  >["context"];

  try {
    ({ organization, context } = await requireSystemAdminCapabilitiesRead());
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
    context,
    "system-admin.capabilities.manage",
  );
  const { searchValue, capabilities, capabilityOptions, roleMatrix, matrixRole } =
    await buildSystemAdminCapabilitiesPageModel({
      organizationId: organization.id,
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
