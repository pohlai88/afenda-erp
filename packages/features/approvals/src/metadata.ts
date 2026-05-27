/**
 * Metadata builders for the approvals feature module.
 *
 * These builders produce governed surface configurations for the approvals
 * workspace. Import via `@afenda/feature-approvals/metadata` in routes.
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

// Module-bound wrappers for the approvals feature module.
// Routes import these instead of the generic domain builders.

export function buildApprovalsRecordListSurface(input: {
  records: readonly ModuleWorkspaceRecord[];
  window?: ModuleWorkspaceWindow;
  query?: ModuleWorkspaceListQuery;
}) {
  return buildModuleRecordListSurface({ moduleId: "approvals", ...input });
}

export function buildApprovalsWorkItemListSurface(input: {
  workItems: readonly ModuleWorkspaceItem[];
  window?: ModuleWorkspaceWindow;
  query?: ModuleWorkspaceListQuery;
}) {
  return buildModuleWorkItemListSurface({ moduleId: "approvals", ...input });
}

export function buildApprovalsCountStatGrid(input: {
  recordCount: number;
  workItemCount: number;
  documentCount: number;
  highPriorityWorkItemCount: number;
}) {
  return buildModuleWorkspaceCountStatGrid({ moduleId: "approvals", ...input });
}

export function buildApprovalsStatGrid(input: Parameters<typeof buildModuleWorkspaceStatGrid>[0]) {
  return buildModuleWorkspaceStatGrid(input);
}

export function buildApprovalsRecordDetailTabs(input: {
  record: ModuleWorkspaceRecordDetail;
}) {
  return _buildRecordDetailTabs({ moduleId: "approvals", ...input });
}

export function buildApprovalsWorkItemDetailTabs(input: {
  workItem: ModuleWorkspaceWorkItemDetail;
}) {
  return _buildWorkItemDetailTabs({ moduleId: "approvals", ...input });
}

