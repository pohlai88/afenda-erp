import type { ModuleId } from "@afenda/config/module-ids";
import { coreModuleIds } from "@afenda/config/module-ids";

import { buildRecordDetailTabs, buildWorkItemDetailTabs } from "./ker-detail-surfaces";
import {
  buildModuleWorkItemKanbanSurface,
  getModuleWorkItemKanbanSurfaceKey,
} from "./ker-kanban-surfaces";
import {
  buildDocumentRegistryListSurface,
  buildDocumentActivityLinesListSurface,
  buildModuleRecordListSurface,
  buildModuleWorkItemListSurface,
  buildSavedViewsListSurface,
  getModuleListSurfaceKeys,
} from "./ker-list-surfaces";
import {
  buildModuleScreenOverviewStatGrid,
  buildModuleWorkspaceCountStatGrid,
  buildModuleWorkspaceStatGrid,
  getModuleOverviewStatSurfaceKey,
  getModuleStatSurfaceKey,
} from "./ker-stat-surfaces";

export type CoreModuleId = (typeof coreModuleIds)[number];

export function createModuleFeatureMetadata<TModuleId extends CoreModuleId>(
  moduleId: TModuleId,
): ModuleFeatureMetadata<TModuleId> {
  return {
    moduleId,

    buildRecordListSurface(
      input: Omit<Parameters<typeof buildModuleRecordListSurface>[0], "moduleId">,
    ) {
      return buildModuleRecordListSurface({ moduleId, ...input });
    },

    buildWorkItemListSurface(
      input: Omit<Parameters<typeof buildModuleWorkItemListSurface>[0], "moduleId">,
    ) {
      return buildModuleWorkItemListSurface({ moduleId, ...input });
    },

    buildCountStatGrid(
      input: Omit<
        Parameters<typeof buildModuleWorkspaceCountStatGrid>[0],
        "moduleId"
      >,
    ) {
      return buildModuleWorkspaceCountStatGrid({ moduleId, ...input });
    },

    buildStatGrid(
      input: Omit<Parameters<typeof buildModuleWorkspaceStatGrid>[0], "moduleId">,
    ) {
      return buildModuleWorkspaceStatGrid({ moduleId, ...input });
    },

    buildOverviewStatGrid(
      input: Omit<
        Parameters<typeof buildModuleScreenOverviewStatGrid>[0],
        "moduleId"
      >,
    ) {
      return buildModuleScreenOverviewStatGrid({ moduleId, ...input });
    },

    buildSavedViewsListSurface(
      input: Omit<Parameters<typeof buildSavedViewsListSurface>[0], "moduleId">,
    ) {
      return buildSavedViewsListSurface({ moduleId, ...input });
    },

    buildDocumentRegistryListSurface(
      input: Omit<
        Parameters<typeof buildDocumentRegistryListSurface>[0],
        "moduleId"
      >,
    ) {
      return buildDocumentRegistryListSurface({ moduleId, ...input });
    },

    buildDocumentActivityLinesListSurface(
      input: Omit<
        Parameters<typeof buildDocumentActivityLinesListSurface>[0],
        "moduleId"
      >,
    ) {
      return buildDocumentActivityLinesListSurface({ moduleId, ...input });
    },

    buildRecordDetailTabs(
      input: Omit<Parameters<typeof buildRecordDetailTabs>[0], "moduleId">,
    ) {
      return buildRecordDetailTabs({ moduleId, ...input });
    },

    buildWorkItemDetailTabs(
      input: Omit<Parameters<typeof buildWorkItemDetailTabs>[0], "moduleId">,
    ) {
      return buildWorkItemDetailTabs({ moduleId, ...input });
    },

    buildWorkItemKanbanSurface(
      input: Omit<
        Parameters<typeof buildModuleWorkItemKanbanSurface>[0],
        "moduleId"
      >,
    ) {
      return buildModuleWorkItemKanbanSurface({ moduleId, ...input });
    },

    getListSurfaceKeys() {
      return getModuleListSurfaceKeys(moduleId);
    },

    getOverviewStatSurfaceKey() {
      return getModuleOverviewStatSurfaceKey(moduleId);
    },

    getStatSurfaceKey() {
      return getModuleStatSurfaceKey(moduleId);
    },

    getWorkItemKanbanSurfaceKey() {
      return getModuleWorkItemKanbanSurfaceKey(moduleId);
    },
  };
}

type BuildRecordListSurfaceInput = Omit<
  Parameters<typeof buildModuleRecordListSurface>[0],
  "moduleId"
>;

type BuildWorkItemListSurfaceInput = Omit<
  Parameters<typeof buildModuleWorkItemListSurface>[0],
  "moduleId"
>;

type BuildCountStatGridInput = Omit<
  Parameters<typeof buildModuleWorkspaceCountStatGrid>[0],
  "moduleId"
>;

type BuildStatGridInput = Omit<
  Parameters<typeof buildModuleWorkspaceStatGrid>[0],
  "moduleId"
>;

type BuildOverviewStatGridInput = Omit<
  Parameters<typeof buildModuleScreenOverviewStatGrid>[0],
  "moduleId"
>;

type BuildSavedViewsListSurfaceInput = Omit<
  Parameters<typeof buildSavedViewsListSurface>[0],
  "moduleId"
>;

type BuildDocumentRegistryListSurfaceInput = Omit<
  Parameters<typeof buildDocumentRegistryListSurface>[0],
  "moduleId"
>;

type BuildDocumentActivityLinesListSurfaceInput = Omit<
  Parameters<typeof buildDocumentActivityLinesListSurface>[0],
  "moduleId"
>;

type BuildRecordDetailTabsInput = Omit<
  Parameters<typeof buildRecordDetailTabs>[0],
  "moduleId"
>;

type BuildWorkItemDetailTabsInput = Omit<
  Parameters<typeof buildWorkItemDetailTabs>[0],
  "moduleId"
>;

type BuildWorkItemKanbanSurfaceInput = Omit<
  Parameters<typeof buildModuleWorkItemKanbanSurface>[0],
  "moduleId"
>;

export type ModuleFeatureMetadata<TModuleId extends CoreModuleId = CoreModuleId> = {
  moduleId: TModuleId;
  buildRecordListSurface(
    input: BuildRecordListSurfaceInput,
  ): ReturnType<typeof buildModuleRecordListSurface>;
  buildWorkItemListSurface(
    input: BuildWorkItemListSurfaceInput,
  ): ReturnType<typeof buildModuleWorkItemListSurface>;
  buildCountStatGrid(
    input: BuildCountStatGridInput,
  ): ReturnType<typeof buildModuleWorkspaceCountStatGrid>;
  buildStatGrid(
    input: BuildStatGridInput,
  ): ReturnType<typeof buildModuleWorkspaceStatGrid>;
  buildOverviewStatGrid(
    input: BuildOverviewStatGridInput,
  ): ReturnType<typeof buildModuleScreenOverviewStatGrid>;
  buildSavedViewsListSurface(
    input: BuildSavedViewsListSurfaceInput,
  ): ReturnType<typeof buildSavedViewsListSurface>;
  buildDocumentRegistryListSurface(
    input: BuildDocumentRegistryListSurfaceInput,
  ): ReturnType<typeof buildDocumentRegistryListSurface>;
  buildDocumentActivityLinesListSurface(
    input: BuildDocumentActivityLinesListSurfaceInput,
  ): ReturnType<typeof buildDocumentActivityLinesListSurface>;
  buildRecordDetailTabs(
    input: BuildRecordDetailTabsInput,
  ): ReturnType<typeof buildRecordDetailTabs>;
  buildWorkItemDetailTabs(
    input: BuildWorkItemDetailTabsInput,
  ): ReturnType<typeof buildWorkItemDetailTabs>;
  buildWorkItemKanbanSurface(
    input: BuildWorkItemKanbanSurfaceInput,
  ): ReturnType<typeof buildModuleWorkItemKanbanSurface>;
  getListSurfaceKeys(): ReturnType<typeof getModuleListSurfaceKeys>;
  getOverviewStatSurfaceKey(): ReturnType<
    typeof getModuleOverviewStatSurfaceKey
  >;
  getStatSurfaceKey(): ReturnType<typeof getModuleStatSurfaceKey>;
  getWorkItemKanbanSurfaceKey(): ReturnType<
    typeof getModuleWorkItemKanbanSurfaceKey
  >;
};

export function isCoreModuleId(moduleId: ModuleId): moduleId is CoreModuleId {
  return (coreModuleIds as readonly ModuleId[]).includes(moduleId);
}
