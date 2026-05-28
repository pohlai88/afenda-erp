/**
 * Client-safe exports for @afenda/feature-system-admin.
 * Browser-safe components, serializable DTOs, and governed UI catalogs.
 */

export { systemAdminRoutePaths } from "./contracts";
export { SystemAdminNav } from "./components/system-admin.nav.component.client";
export { InviteMemberForm } from "./components/system-admin.invite-member-form.component.client";
export { RoleOverrideForm } from "./components/system-admin.role-override-form.component.client";
export { TenantSettingsForm } from "./components/system-admin.tenant-settings-form.component.client";
export { RetentionPolicyForm } from "./components/system-admin.retention-policy-form.component.client";
export { CreateApiCredentialForm } from "./components/system-admin.create-api-credential-form.component.client";
export { CreateWebhookForm } from "./components/system-admin.create-webhook-form.component.client";
export {
  MemberRoleTrailingCell,
  InvitationTrailingCell,
} from "./components/system-admin.identity-trailing-cells.component.client";
export {
  ApiCredentialTrailingCell,
  WebhookTrailingCell,
} from "./components/system-admin.integration-trailing-cells.component.client";
export { SandboxTrailingCell } from "./components/system-admin.sandbox-trailing-cell.component.client";
export { AiFeatureEntitlementTrailingCell } from "./components/system-admin.ai-feature-entitlement-trailing-cell.component.client";
export { SystemAdminInviteUserDialog } from "./users/components/system-admin.invite-user-dialog.component.client";
export { SystemAdminAssignRoleDialog } from "./roles/components/system-admin.assign-role-dialog.component.client";

export {
  isSystemAdminApiScope,
  isSystemAdminPermissionKey,
  isSystemAdminWebhookEvent,
  systemAdminLynxOutcomeMonitorThresholdCatalog,
  systemAdminApiScopes,
  systemAdminPermissionCatalog,
  systemAdminWebhookEvents,
  systemAdminDefaultWebhookEventPresets,
  type SystemAdminApiScope,
  type SystemAdminCatalogOption,
  type SystemAdminLynxOutcomeMonitorId,
  type SystemAdminLynxOutcomeMonitorThresholdKey,
  type SystemAdminWebhookEvent,
} from "./contracts";

export type { SystemAdminActionResult } from "./contracts";
export type {
  CreateApiCredentialActionData,
  CreateWebhookActionData,
  InviteMemberActionData,
} from "./contracts";
