import {
  buildModulesListSurface,
  systemAdminModulesSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  SystemAdminModuleSettingsDialog,
  SystemAdminModuleTrailingCell,
} from "@afenda/feature-system-admin/client";
import { systemAdminModulesUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminModulesPageModel,
  requireSystemAdminModulesRead,
  SystemAdminModulesAccessDenied,
  updateSystemAdminModuleSettingsAction,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modules — System admin",
  description: systemAdminModulesUiCopy.page.description,
};

export default async function SystemAdminModulesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let organization: Awaited<
    ReturnType<typeof requireSystemAdminModulesRead>
  >["organization"];
  let context: Awaited<
    ReturnType<typeof requireSystemAdminModulesRead>
  >["context"];

  try {
    ({ organization, context } = await requireSystemAdminModulesRead());
  } catch {
    return <SystemAdminModulesAccessDenied />;
  }

  const pageCopy = systemAdminModulesUiCopy;
  const canMutate = hasExecutionPermission(context, "system-admin.modules.manage");
  const { searchValue, modules, moduleOptions } =
    await buildSystemAdminModulesPageModel({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      searchParams: resolvedSearchParams,
    });

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={pageCopy.page.title}
        description={pageCopy.page.description}
      />

      <GovernedPatternCListSection
        title={pageCopy.listSurface.title}
        surfaceKey={systemAdminModulesSurfaceKey}
        listConfiguration={buildModulesListSurface({
          searchValue,
          modules,
          canMutate,
        })}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{
          header: "Actions",
          Cell: SystemAdminModuleTrailingCell,
        }}
      />

      {canMutate ? (
        <SectionPanel
          title={pageCopy.settingsPanel.title}
          description={pageCopy.settingsPanel.description}
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
