/**
 * Client-safe exports for @afenda/feature-system-admin.
 */

export * from "./approvals/client";
export * from "./audit-viewer/client";
export * from "./billing/client";
export * from "./capabilities/client";
export * from "./diagnostics/client";
export * from "./integrations/client";
export * from "./lynx/client";
export * from "./memberships/client";
export * from "./modules/client";
export * from "./organization/client";
export * from "./overview/client";
export * from "./permissions/client";
export * from "./policies/client";
export * from "./reliability/client";
export * from "./roles/client";
export * from "./security/client";
export * from "./users/client";

export { systemAdminRoutePaths } from "./overview/contracts/system-admin.route-paths.contract";
export {
  isSystemAdminApiScope,
  isSystemAdminWebhookEvent,
  systemAdminApiScopes,
  systemAdminWebhookEvents,
  systemAdminDefaultWebhookEventPresets,
  type SystemAdminApiScope,
  type SystemAdminWebhookEvent,
} from "./integrations/contracts/system-admin.integrations-catalog.contract";
export {
  isSystemAdminPermissionKey,
  systemAdminPermissionCatalog,
  type SystemAdminCatalogOption,
} from "./permissions/contracts/system-admin.permission-catalog.contract";
export {
  isSystemAdminDeprecatedPermissionKey,
  requiresElevatedPermissionConfirmation,
  requiresHighRiskPermissionConfirmation,
  resolveSystemAdminPermissionRiskLevel,
} from "./permissions/contracts/system-admin.permission-risk.shared";
export {
  getSystemAdminLynxOutcomeMonitorThresholdCatalog,
  systemAdminLynxOutcomeMonitorThresholdCatalog,
  type SystemAdminLynxOutcomeMonitorId,
  type SystemAdminLynxOutcomeMonitorThresholdKey,
} from "./lynx/contracts/system-admin.lynx-outcome-monitor-catalog.contract";
export type { SystemAdminActionResult } from "./tenant-execution/contracts/system-admin.action-result.contract";
export type {
  CreateApiCredentialActionData,
  CreateWebhookActionData,
} from "./integrations/contracts/system-admin.integrations-action-dtos.contract";
export type { InviteMemberActionData } from "./memberships/contracts/system-admin.memberships-action-dtos.contract";
export type { OrganizationSecuritySettings } from "./security/contracts/system-admin.security-settings.contract";
export type {
  SecurityReadinessReport,
  SecurityReadinessVerdict,
} from "./security/contracts/system-admin.security-readiness.contract";
export type { OrganizationDefaultsFormDefaults } from "./organization/components/system-admin.organization-defaults-form.component.client";
