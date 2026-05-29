import { createModuleFeatureMetadata } from "@afenda/kernel";

export const {
  moduleId,
  buildRecordListSurface,
  buildWorkItemListSurface,
  buildCountStatGrid,
  buildStatGrid,
  buildOverviewStatGrid,
  buildSavedViewsListSurface,
  buildDocumentRegistryListSurface,
  buildRecordDetailTabs,
  buildWorkItemDetailTabs,
  buildWorkItemKanbanSurface,
  getListSurfaceKeys,
  getOverviewStatSurfaceKey,
  getStatSurfaceKey,
  getWorkItemKanbanSurfaceKey,
} = createModuleFeatureMetadata("system-admin");

export {
  getSystemAdminSurfaceKeys,
  systemAdminAiApprovalsSurfaceKey,
  systemAdminAiEntitlementsSurfaceKey,
  systemAdminAiSandboxesSurfaceKey,
  systemAdminAiUsageSurfaceKey,
  systemAdminApiCredentialsSurfaceKey,
  systemAdminApprovalsSurfaceKey,
  systemAdminAuditViewerSurfaceKey,
  systemAdminBillingSurfaceKey,
  systemAdminCapabilitiesSurfaceKey,
  systemAdminCronSurfaceKey,
  systemAdminDiagnosticsSurfaceKey,
  systemAdminGatewaySpendSurfaceKey,
  systemAdminUsersSurfaceKey,
  systemAdminMembersSurfaceKey,
  systemAdminModulesSurfaceKey,
  systemAdminOrganizationSurfaceKey,
  systemAdminPermissionsSurfaceKey,
  systemAdminRolesSurfaceKey,
  systemAdminPoliciesSurfaceKey,
  systemAdminRetentionSurfaceKey,
  systemAdminRoleOverridesSurfaceKey,
  systemAdminSecuritySurfaceKey,
  systemAdminSsoSurfaceKey,
  systemAdminWebhookDeliveriesSurfaceKey,
  systemAdminWebhooksSurfaceKey,
} from "./overview/surfaces/system-admin.surface-keys.shared";

export { buildCapabilitiesListSurface } from "./capabilities/data/system-admin.capabilities-list.surface";
export { buildModulesListSurface } from "./modules/data/system-admin.modules-list.surface";
export { systemAdminModulesUiCopy } from "./modules/surface/system-admin.modules-ui.copy.shared";
export { buildOrganizationDefaultsListSurface } from "./organization/data/system-admin.organization-list.surface";
export { buildPermissionsListSurface } from "./permissions/surface/system-admin.permissions-list.surface";
export { buildRolesListSurface } from "./roles/data/system-admin.roles-list.surface";

export { buildPoliciesListSurface } from "./policies/data/system-admin.policy-rules.surface";
export {
  buildApprovalsListSurface,
  systemAdminApprovalsUiCopy,
} from "./approvals/surface";

export { buildBillingPostureListSurface } from "./billing/data/system-admin.billing.surface";
export { buildCronHealthListSurface } from "./reliability/data/system-admin.cron-health.surface";
export { buildMembersListSurface } from "./memberships/surface/system-admin.memberships-list.surface";
export { systemAdminMembershipsUiCopy } from "./memberships/surface/system-admin.memberships-ui.copy.shared";
export { systemAdminMembershipsGalleryRows } from "./memberships/surface/system-admin.memberships-gallery.fixtures.shared";
export { buildUsersListSurface } from "./users/surface/system-admin.users-list.surface";
export { systemAdminUsersUiCopy } from "./users/surface/system-admin.users-ui.copy.shared";
export { systemAdminUsersGalleryRows } from "./users/surface/system-admin.users-gallery.fixtures.shared";
export { buildRoleOverridesListSurface } from "./permissions/surface/system-admin.role-overrides-list.surface";
export { systemAdminPermissionsUiCopy } from "./permissions/surface/system-admin.permissions-ui.copy.shared";
export {
  buildApiCredentialsListSurface,
  buildSsoConnectionsListSurface,
  buildWebhookDeliveriesListSurface,
  buildWebhooksListSurface,
} from "./integrations/data/system-admin.integrations-list.surface";
export { buildSystemAdminSecuritySettingsListSurface } from "./security/data/system-admin.security.surface";
export {
  buildSystemAdminDiagnosticsBlockedIssuesListSurface,
  buildSystemAdminDiagnosticsInfoIssuesListSurface,
  buildSystemAdminDiagnosticsIssuesListSurface,
  buildSystemAdminDiagnosticsModuleCoverageListSurface,
  buildSystemAdminDiagnosticsRecentChangesListSurface,
  buildSystemAdminDiagnosticsWarningIssuesListSurface,
  systemAdminDiagnosticsModuleCoverageSurfaceKey,
  systemAdminDiagnosticsRecentChangesSurfaceKey,
} from "./diagnostics/data/system-admin.diagnostics.surface";
export { buildSystemAdminAuditViewerListSurface } from "./audit-viewer/data/system-admin.audit.surface";
export { buildSystemAdminRetentionPoliciesListSurface } from "./audit-viewer/data/system-admin.retention.surface";
export {
  buildSystemAdminAiApprovalsListSurface,
  buildSystemAdminAiEntitlementsListSurface,
  buildSystemAdminAiSandboxesListSurface,
  buildSystemAdminAiUsageListSurface,
} from "./lynx/data/system-admin.lynx.surface";
export { buildGatewaySpendListSurface } from "./lynx/data/system-admin.gateway-spend.surface";
export {
  buildSystemAdminOverviewStatGrid,
  buildSystemAdminOverviewStatGroups,
  systemAdminOverviewStatSurfaceKey,
} from "./overview/surfaces";
