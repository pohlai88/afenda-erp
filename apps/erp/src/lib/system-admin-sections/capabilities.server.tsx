import {
  buildCapabilitiesListSurface,
  systemAdminCapabilitiesSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  SystemAdminCapabilitySettingsDialog,
  SystemAdminCapabilityTrailingCell,
} from "@afenda/feature-system-admin/client";
import {
  buildSystemAdminCapabilitiesPageModel,
  requireSystemAdminCapabilitiesRead,
  updateSystemAdminCapabilitySettingsAction,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capabilities — System admin",
  description: "Execution capability metadata and route coverage.",
};

export default async function SystemAdminCapabilitiesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { context, organization } = await requireSystemAdminCapabilitiesRead();
  const canMutate = hasExecutionPermission(
    context,
    "system-admin.capabilities.manage",
  );
  const { searchValue, capabilities, capabilityOptions } =
    await buildSystemAdminCapabilitiesPageModel({
      organizationId: organization.id,
      searchParams: resolvedSearchParams,
    });

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title="Capabilities"
        description="Capability metadata comes from the execution kernel. Coverage verdicts flag missing permissions, routes, audit mappings, and org-level availability."
      />

      <GovernedPatternCListSection
        title="Execution capabilities"
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

      {canMutate ? (
        <SectionPanel
          title="Update capability availability"
          description="Org-level capability availability is stored in tenant capability settings and audited."
        >
          <SystemAdminCapabilitySettingsDialog
            updateCapabilitySettingsAction={
              updateSystemAdminCapabilitySettingsAction
            }
            capabilityOptions={capabilityOptions}
          />
        </SectionPanel>
      ) : null}
    </div>
  );
}
