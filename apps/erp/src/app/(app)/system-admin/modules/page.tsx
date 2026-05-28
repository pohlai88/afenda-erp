import {
  buildModulesListSurface,
  systemAdminModulesSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminModulesPageModel,
  requireSystemAdminModulesRead,
  updateSystemAdminModuleSettingsAction,
} from "@afenda/feature-system-admin/server";
import { SystemAdminModuleSettingsDialog } from "@afenda/feature-system-admin/client";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modules — System admin",
  description: "Module visibility and readiness configuration.",
};

export default async function SystemAdminModulesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { organization } = await requireSystemAdminModulesRead();
  const canMutate =
    organization.capabilities.includes("system-admin.modules.manage") ||
    organization.capabilities.includes("system-admin.settings.write");
  const { searchValue, modules, moduleOptions } =
    await buildSystemAdminModulesPageModel({
      organizationId: organization.id,
      searchParams: resolvedSearchParams,
    });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Modules"
        description="Tenant module availability and readiness controls. Disabled modules are removed from active navigation targets."
      />

      <GovernedPatternCListSection
        title="Module readiness"
        surfaceKey={systemAdminModulesSurfaceKey}
        listConfiguration={buildModulesListSurface({ searchValue, modules })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate ? (
        <SectionPanel
          title="Update module settings"
          description="Changes are audited and enforced through tenant module settings consumed by AppShell navigation."
        >
          <SystemAdminModuleSettingsDialog
            updateModuleSettingsAction={updateSystemAdminModuleSettingsAction}
            moduleOptions={moduleOptions}
          />
        </SectionPanel>
      ) : null}
    </div>
  );
}
