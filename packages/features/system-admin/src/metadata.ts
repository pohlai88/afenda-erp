import { createModuleFeatureMetadata } from "@afenda/kernel/feature-metadata";

export const {
  moduleId,
  buildRecordListSurface,
  buildWorkItemListSurface,
  buildCountStatGrid,
  buildStatGrid,
  buildOverviewStatGrid,
  buildSavedViewsListSurface,
  buildDocumentRegistryListSurface,
  buildDocumentActivityLinesListSurface,
  buildRecordDetailTabs,
  buildWorkItemDetailTabs,
  buildWorkItemKanbanSurface,
  getListSurfaceKeys,
  getOverviewStatSurfaceKey,
  getStatSurfaceKey,
  getWorkItemKanbanSurfaceKey,
} = createModuleFeatureMetadata("system-admin");

export * from "./approvals/metadata";
export * from "./audit-viewer/metadata";
export * from "./billing/metadata";
export * from "./capabilities/metadata";
export * from "./data-management/metadata";
export * from "./diagnostics/metadata";
export * from "./integrations/metadata";
export * from "./lynx/metadata";
export * from "./memberships/metadata";
export * from "./modules/metadata";
export * from "./organization/metadata";
export * from "./overview/metadata";
export * from "./permissions/metadata";
export * from "./policies/metadata";
export * from "./reliability/metadata";
export * from "./roles/metadata";
export * from "./security/metadata";
export * from "./tenant-execution/metadata";
export * from "./users/metadata";
