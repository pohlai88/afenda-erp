/**
 * Client-safe exports for @afenda/feature-system-admin.
 * Browser-safe components, serializable DTOs, and governed UI catalogs.
 */

export { systemAdminRoutePaths } from "./overview/contracts/system-admin.route-paths.contract";
export { SystemAdminNav } from "./overview/components/system-admin.nav.component.client";
export { InviteMemberForm } from "./memberships/components/system-admin.invite-member-form.component.client";
export { SystemAdminRoleAssignmentActions } from "./roles/components/system-admin.role-assignment-actions.component.client";
export { RoleOverrideForm } from "./permissions/components/system-admin.role-override-form.component.client";
export { RetentionPolicyForm } from "./audit-viewer/components/system-admin.retention-policy-form.component.client";
export { CreateApiCredentialForm } from "./integrations/components/system-admin.create-api-credential-form.component.client";
export { CreateWebhookForm } from "./integrations/components/system-admin.create-webhook-form.component.client";
export { SystemAdminUserTrailingCell } from "./users/components/system-admin.users-trailing-cells.component.client";
export { SystemAdminUserAccessInspectionPanel } from "./users/components/system-admin.user-access-inspection.component.client";
export { SystemAdminMembershipTrailingCell } from "./memberships/components/system-admin.memberships-trailing-cells.component.client";
export {
  ApiCredentialTrailingCell,
  WebhookTrailingCell,
} from "./integrations/components/system-admin.integration-trailing-cells.component.client";
export {
  AiFeatureEntitlementTrailingCell,
  SandboxTrailingCell,
} from "./lynx/components";
export { SystemAdminInviteUserDialog } from "./users/components/system-admin.invite-user-dialog.component.client";
export { SystemAdminAssignRoleDialog } from "./roles/components/system-admin.assign-role-dialog.component.client";
export { SystemAdminModuleSettingsDialog } from "./modules/components/system-admin.module-settings-dialog.component.client";
export { SystemAdminModuleTrailingCell } from "./modules/components/system-admin.modules-trailing-cells.component.client";
export { SystemAdminCapabilitySettingsDialog } from "./capabilities/components/system-admin.capability-settings-dialog.component.client";
export { SystemAdminCapabilityTrailingCell } from "./capabilities/components/system-admin.capabilities-trailing-cells.component.client";
export { SystemAdminPolicyRuleEditor } from "./policies/components/system-admin.policy-rule-editor.component.client";
export { SystemAdminPolicyTrailingCell } from "./policies/components/system-admin.policy-rules-trailing-cells.component.client";
export { SystemAdminApprovalRuleEditor } from "./approvals/components/system-admin.approval-rule-editor.component.client";
export { SystemAdminAuditExportButton } from "./audit-viewer/components/system-admin.audit-export-button.component.client";
export { SystemAdminSecurityForm } from "./security/components/system-admin.security-form.component.client";
export { SystemAdminOrganizationDefaultsForm } from "./organization/components/system-admin.organization-defaults-form.component.client";
export type { OrganizationDefaultsFormDefaults } from "./organization/components/system-admin.organization-defaults-form.component.client";

export {
  isSystemAdminApiScope,
  isSystemAdminWebhookEvent,
} from "./integrations/contracts/system-admin.integrations-catalog.contract";
export {
  isSystemAdminPermissionKey,
  systemAdminPermissionCatalog,
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
export {
  systemAdminApiScopes,
  systemAdminWebhookEvents,
  systemAdminDefaultWebhookEventPresets,
  type SystemAdminApiScope,
  type SystemAdminWebhookEvent,
} from "./integrations/contracts/system-admin.integrations-catalog.contract";
export type { SystemAdminCatalogOption } from "./permissions/contracts/system-admin.permission-catalog.contract";

export type { SystemAdminActionResult } from "./tenant-execution/contracts/system-admin.action-result.contract";
export type {
  CreateApiCredentialActionData,
  CreateWebhookActionData,
} from "./integrations/contracts/system-admin.integrations-action-dtos.contract";
export type { InviteMemberActionData } from "./memberships/contracts/system-admin.memberships-action-dtos.contract";
