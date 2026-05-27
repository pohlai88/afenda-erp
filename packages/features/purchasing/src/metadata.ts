/**
 * Metadata builders for the purchasing feature module.
 *
 * These builders produce governed surface configurations for the purchasing
 * workspace. Import via `@afenda/feature-purchasing/metadata` in routes.
 */
import {
  buildModuleRecordListSurface,
  buildModuleWorkItemListSurface,
  buildModuleWorkspaceCountStatGrid,
  buildModuleWorkspaceStatGrid,
  buildRecordDetailTabs as _buildRecordDetailTabs,
  buildWorkItemDetailTabs as _buildWorkItemDetailTabs,
  type ModuleWorkspaceListQuery,
  type ModuleWorkspaceRecord,
  type ModuleWorkspaceRecordDetail,
  type ModuleWorkspaceWindow,
  type ModuleWorkspaceItem,
  type ModuleWorkspaceWorkItemDetail,
} from "@afenda/domain";

// Module-bound wrappers for the purchasing feature module.
// Routes import these instead of the generic domain builders.

export function buildPurchasingRecordListSurface(input: {
  records: readonly ModuleWorkspaceRecord[];
  window?: ModuleWorkspaceWindow;
  query?: ModuleWorkspaceListQuery;
}) {
  return buildModuleRecordListSurface({ moduleId: "purchasing", ...input });
}

export function buildPurchasingWorkItemListSurface(input: {
  workItems: readonly ModuleWorkspaceItem[];
  window?: ModuleWorkspaceWindow;
  query?: ModuleWorkspaceListQuery;
}) {
  return buildModuleWorkItemListSurface({ moduleId: "purchasing", ...input });
}

export function buildPurchasingCountStatGrid(input: {
  recordCount: number;
  workItemCount: number;
  documentCount: number;
  highPriorityWorkItemCount: number;
}) {
  return buildModuleWorkspaceCountStatGrid({ moduleId: "purchasing", ...input });
}

export function buildPurchasingStatGrid(input: Parameters<typeof buildModuleWorkspaceStatGrid>[0]) {
  return buildModuleWorkspaceStatGrid(input);
}

export function buildPurchasingRecordDetailTabs(input: {
  record: ModuleWorkspaceRecordDetail;
}) {
  return _buildRecordDetailTabs({ moduleId: "purchasing", ...input });
}

export function buildPurchasingWorkItemDetailTabs(input: {
  workItem: ModuleWorkspaceWorkItemDetail;
}) {
  return _buildWorkItemDetailTabs({ moduleId: "purchasing", ...input });
}

