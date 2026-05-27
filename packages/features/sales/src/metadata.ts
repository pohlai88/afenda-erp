/**
 * Metadata builders for the sales feature module.
 *
 * These builders produce governed surface configurations for the sales
 * workspace. Import via `@afenda/feature-sales/metadata` in routes.
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

// Module-bound wrappers for the sales feature module.
// Routes import these instead of the generic domain builders.

export function buildSalesRecordListSurface(input: {
  records: readonly ModuleWorkspaceRecord[];
  window?: ModuleWorkspaceWindow;
  query?: ModuleWorkspaceListQuery;
}) {
  return buildModuleRecordListSurface({ moduleId: "sales", ...input });
}

export function buildSalesWorkItemListSurface(input: {
  workItems: readonly ModuleWorkspaceItem[];
  window?: ModuleWorkspaceWindow;
  query?: ModuleWorkspaceListQuery;
}) {
  return buildModuleWorkItemListSurface({ moduleId: "sales", ...input });
}

export function buildSalesCountStatGrid(input: {
  recordCount: number;
  workItemCount: number;
  documentCount: number;
  highPriorityWorkItemCount: number;
}) {
  return buildModuleWorkspaceCountStatGrid({ moduleId: "sales", ...input });
}

export function buildSalesStatGrid(input: Parameters<typeof buildModuleWorkspaceStatGrid>[0]) {
  return buildModuleWorkspaceStatGrid(input);
}

export function buildSalesRecordDetailTabs(input: {
  record: ModuleWorkspaceRecordDetail;
}) {
  return _buildRecordDetailTabs({ moduleId: "sales", ...input });
}

export function buildSalesWorkItemDetailTabs(input: {
  workItem: ModuleWorkspaceWorkItemDetail;
}) {
  return _buildWorkItemDetailTabs({ moduleId: "sales", ...input });
}

