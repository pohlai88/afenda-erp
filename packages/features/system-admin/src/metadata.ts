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
  systemAdminInvitationsSurfaceKey,
  systemAdminMembersSurfaceKey,
  systemAdminModulesSurfaceKey,
  systemAdminOrganizationSurfaceKey,
  systemAdminPermissionsSurfaceKey,
  systemAdminPoliciesSurfaceKey,
  systemAdminRetentionSurfaceKey,
  systemAdminRoleOverridesSurfaceKey,
  systemAdminSecuritySurfaceKey,
  systemAdminSettingsSurfaceKey,
  systemAdminSsoSurfaceKey,
  systemAdminWebhookDeliveriesSurfaceKey,
  systemAdminWebhooksSurfaceKey,
} from "./surfaces/system-admin.surface-keys.shared";

export {
  buildCapabilitiesListSurface,
  buildModulesListSurface,
  buildOrganizationDefaultsListSurface,
  buildPermissionsListSurface,
} from "./surfaces/system-admin.control.surface";

export { buildPoliciesListSurface } from "./policies/data/system-admin.policy-rules.surface";
export { buildApprovalsListSurface } from "./approvals/data/system-admin.approval-rules.surface";

export { buildTenantSettingsListSurface } from "./surfaces/system-admin.settings.surface";
export { buildBillingPostureListSurface } from "./surfaces/system-admin.billing.surface";
export { buildCronHealthListSurface } from "./surfaces/system-admin.cron-health.surface";
export {
  buildInvitationsListSurface,
  buildMembersListSurface,
  buildRoleOverridesListSurface,
} from "./surfaces/system-admin.identity.surface";
export {
  buildApiCredentialsListSurface,
  buildSsoConnectionsListSurface,
  buildWebhookDeliveriesListSurface,
  buildWebhooksListSurface,
} from "./surfaces/system-admin.integrations.surface";
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
} from "./surfaces/system-admin.machine-layer.surface";
export { buildGatewaySpendListSurface } from "./surfaces/system-admin.gateway-spend.surface";
