/**
 * Metadata builders for the reports feature module.
 *
 * These builders produce governed surface configurations for the reports
 * workspace. Import via `@afenda/feature-reports/metadata` in routes.
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

// Module-bound wrappers for the reports feature module.
// Routes import these instead of the generic domain builders.

export function buildReportsRecordListSurface(input: {
  records: readonly ModuleWorkspaceRecord[];
  window?: ModuleWorkspaceWindow;
  query?: ModuleWorkspaceListQuery;
}) {
  return buildModuleRecordListSurface({ moduleId: "reports", ...input });
}

export function buildReportsWorkItemListSurface(input: {
  workItems: readonly ModuleWorkspaceItem[];
  window?: ModuleWorkspaceWindow;
  query?: ModuleWorkspaceListQuery;
}) {
  return buildModuleWorkItemListSurface({ moduleId: "reports", ...input });
}

export function buildReportsCountStatGrid(input: {
  recordCount: number;
  workItemCount: number;
  documentCount: number;
  highPriorityWorkItemCount: number;
}) {
  return buildModuleWorkspaceCountStatGrid({ moduleId: "reports", ...input });
}

export function buildReportsStatGrid(input: Parameters<typeof buildModuleWorkspaceStatGrid>[0]) {
  return buildModuleWorkspaceStatGrid(input);
}

export function buildReportsRecordDetailTabs(input: {
  record: ModuleWorkspaceRecordDetail;
}) {
  return _buildRecordDetailTabs({ moduleId: "reports", ...input });
}

export function buildReportsWorkItemDetailTabs(input: {
  workItem: ModuleWorkspaceWorkItemDetail;
}) {
  return _buildWorkItemDetailTabs({ moduleId: "reports", ...input });
}

