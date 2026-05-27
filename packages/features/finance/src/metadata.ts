/**
 * Metadata builders for the finance feature module.
 *
 * These builders produce governed surface configurations for the finance
 * workspace. Import via `@afenda/feature-finance/metadata` in routes.
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

// Module-bound wrappers for the finance feature module.
// Routes import these instead of the generic domain builders.

export function buildFinanceRecordListSurface(input: {
  records: readonly ModuleWorkspaceRecord[];
  window?: ModuleWorkspaceWindow;
  query?: ModuleWorkspaceListQuery;
}) {
  return buildModuleRecordListSurface({ moduleId: "finance", ...input });
}

export function buildFinanceWorkItemListSurface(input: {
  workItems: readonly ModuleWorkspaceItem[];
  window?: ModuleWorkspaceWindow;
  query?: ModuleWorkspaceListQuery;
}) {
  return buildModuleWorkItemListSurface({ moduleId: "finance", ...input });
}

export function buildFinanceCountStatGrid(input: {
  recordCount: number;
  workItemCount: number;
  documentCount: number;
  highPriorityWorkItemCount: number;
}) {
  return buildModuleWorkspaceCountStatGrid({ moduleId: "finance", ...input });
}

export function buildFinanceStatGrid(input: Parameters<typeof buildModuleWorkspaceStatGrid>[0]) {
  return buildModuleWorkspaceStatGrid(input);
}

export function buildFinanceRecordDetailTabs(input: {
  record: ModuleWorkspaceRecordDetail;
}) {
  return _buildRecordDetailTabs({ moduleId: "finance", ...input });
}

export function buildFinanceWorkItemDetailTabs(input: {
  workItem: ModuleWorkspaceWorkItemDetail;
}) {
  return _buildWorkItemDetailTabs({ moduleId: "finance", ...input });
}

