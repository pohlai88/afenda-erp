import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";

import { updateSystemAdminModuleSettingsAction } from "./sys-module-settings.actions.server";
import { buildSystemAdminModulesPageModel } from "./sys-modules.page-model.server";
import { requireSystemAdminModulesRead } from "./sys-modules.policy.server";
import { buildModulesListSurface, systemAdminModulesSurfaceKey } from "./sys-modules-list.surface";
import { systemAdminModulesUiCopy } from "./sys-modules-ui.copy.shared";
import { SystemAdminModuleSettingsDialog } from "./sys-module-settings-dialog.component.client";
import { SystemAdminModulesAccessDenied } from "./sys-modules-access.component.server";
import { SystemAdminModuleTrailingCell } from "./sys-modules-trailing-cells.component.client";

type SystemAdminModulesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function SystemAdminModulesPage({
  searchParams,
}: SystemAdminModulesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireSystemAdminModulesRead>>;

  try {
    guard = await requireSystemAdminModulesRead();
  } catch {
    return <SystemAdminModulesAccessDenied />;
  }

  const pageCopy = systemAdminModulesUiCopy;
  const canMutate = hasExecutionPermission(
    guard.context,
    "system-admin.modules.manage",
  );
  const { searchValue, modules, moduleOptions } =
    await buildSystemAdminModulesPageModel({
      organizationId: guard.organization.id,
      actorId: guard.context.userId,
      actorType: guard.context.actorType,
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
