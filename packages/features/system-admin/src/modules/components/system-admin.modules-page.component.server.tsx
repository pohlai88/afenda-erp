import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";

import { updateSystemAdminModuleSettingsAction } from "../actions";
import { buildSystemAdminModulesPageModel } from "../data";
import { requireSystemAdminModulesRead } from "../policies";
import {
  buildModulesListSurface,
  systemAdminModulesSurfaceKey,
  systemAdminModulesUiCopy,
} from "../surface";
import { SystemAdminModuleSettingsDialog } from "./system-admin.module-settings-dialog.component.client";
import { SystemAdminModulesAccessDenied } from "./system-admin.modules-access.component.server";
import { SystemAdminModuleTrailingCell } from "./system-admin.modules-trailing-cells.component.client";

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
