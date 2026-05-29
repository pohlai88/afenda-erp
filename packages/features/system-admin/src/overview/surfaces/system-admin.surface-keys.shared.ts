import { systemAdminAuditViewerSurfaceKey } from "../../audit-viewer/data/system-admin.audit.surface";
import { systemAdminRetentionSurfaceKey } from "../../audit-viewer/data/system-admin.retention.surface";
import { systemAdminSecuritySurfaceKey } from "../../security/data/system-admin.security.surface";
import { systemAdminUsersSurfaceKey } from "../../users/surface/system-admin.users-list.surface";
import { systemAdminMembersSurfaceKey } from "../../memberships/surface/system-admin.memberships-list.surface";
import { systemAdminRoleOverridesSurfaceKey } from "../../permissions/surface/system-admin.role-overrides-list.surface";
import {
  systemAdminApiCredentialsSurfaceKey,
  systemAdminSsoSurfaceKey,
  systemAdminWebhookDeliveriesSurfaceKey,
  systemAdminWebhooksSurfaceKey,
} from "../../integrations/data/system-admin.integrations-list.surface";
import {
  systemAdminAiApprovalsSurfaceKey,
  systemAdminAiSandboxesSurfaceKey,
  systemAdminAiEntitlementsSurfaceKey,
  systemAdminAiUsageSurfaceKey,
} from "../../lynx/data/system-admin.lynx.surface";
import { systemAdminGatewaySpendSurfaceKey } from "../../lynx/data/system-admin.gateway-spend.surface";
import { systemAdminBillingSurfaceKey } from "../../billing/data/system-admin.billing.surface";
import { systemAdminCronSurfaceKey } from "../../reliability/data/system-admin.cron-health.surface";
import { systemAdminCapabilitiesSurfaceKey } from "../../capabilities/data/system-admin.capabilities-list.surface";
import { systemAdminModulesSurfaceKey } from "../../modules/data/system-admin.modules-list.surface";
import { systemAdminOrganizationSurfaceKey } from "../../organization/data/system-admin.organization-list.surface";
import { systemAdminPermissionsSurfaceKey } from "../../permissions/surface/system-admin.permissions-list.surface";
import { systemAdminRolesSurfaceKey } from "../../roles/data/system-admin.roles-list.surface";
import {
  systemAdminDiagnosticsModuleCoverageSurfaceKey,
  systemAdminDiagnosticsRecentChangesSurfaceKey,
  systemAdminDiagnosticsSurfaceKey,
} from "../../diagnostics/data/system-admin.diagnostics.surface";
import { systemAdminApprovalsSurfaceKey } from "../../approvals/data/system-admin.approval-rules.surface";
import { systemAdminPoliciesSurfaceKey } from "../../policies/data/system-admin.policy-rules.surface";

export {
  systemAdminAuditViewerSurfaceKey,
  systemAdminRetentionSurfaceKey,
  systemAdminSecuritySurfaceKey,
  systemAdminUsersSurfaceKey,
  systemAdminMembersSurfaceKey,
  systemAdminRoleOverridesSurfaceKey,
  systemAdminApiCredentialsSurfaceKey,
  systemAdminSsoSurfaceKey,
  systemAdminWebhookDeliveriesSurfaceKey,
  systemAdminWebhooksSurfaceKey,
  systemAdminAiApprovalsSurfaceKey,
  systemAdminAiSandboxesSurfaceKey,
  systemAdminAiEntitlementsSurfaceKey,
  systemAdminAiUsageSurfaceKey,
  systemAdminGatewaySpendSurfaceKey,
  systemAdminCronSurfaceKey,
  systemAdminBillingSurfaceKey,
  systemAdminModulesSurfaceKey,
  systemAdminCapabilitiesSurfaceKey,
  systemAdminPermissionsSurfaceKey,
  systemAdminRolesSurfaceKey,
  systemAdminOrganizationSurfaceKey,
  systemAdminDiagnosticsSurfaceKey,
  systemAdminDiagnosticsModuleCoverageSurfaceKey,
  systemAdminDiagnosticsRecentChangesSurfaceKey,
  systemAdminPoliciesSurfaceKey,
  systemAdminApprovalsSurfaceKey,
};

export function getSystemAdminSurfaceKeys() {
  return {
    auditViewer: systemAdminAuditViewerSurfaceKey,
    retention: systemAdminRetentionSurfaceKey,
    security: systemAdminSecuritySurfaceKey,
    members: systemAdminMembersSurfaceKey,
    users: systemAdminUsersSurfaceKey,
    roleOverrides: systemAdminRoleOverridesSurfaceKey,
    apiCredentials: systemAdminApiCredentialsSurfaceKey,
    webhooks: systemAdminWebhooksSurfaceKey,
    webhookDeliveries: systemAdminWebhookDeliveriesSurfaceKey,
    sso: systemAdminSsoSurfaceKey,
    aiUsage: systemAdminAiUsageSurfaceKey,
    aiApprovals: systemAdminAiApprovalsSurfaceKey,
    aiSandboxes: systemAdminAiSandboxesSurfaceKey,
    aiEntitlements: systemAdminAiEntitlementsSurfaceKey,
    gatewaySpend: systemAdminGatewaySpendSurfaceKey,
    cron: systemAdminCronSurfaceKey,
    billing: systemAdminBillingSurfaceKey,
    modules: systemAdminModulesSurfaceKey,
    capabilities: systemAdminCapabilitiesSurfaceKey,
    permissions: systemAdminPermissionsSurfaceKey,
    roles: systemAdminRolesSurfaceKey,
    organization: systemAdminOrganizationSurfaceKey,
    diagnostics: systemAdminDiagnosticsSurfaceKey,
    diagnosticsModuleCoverage: systemAdminDiagnosticsModuleCoverageSurfaceKey,
    diagnosticsRecentChanges: systemAdminDiagnosticsRecentChangesSurfaceKey,
    policies: systemAdminPoliciesSurfaceKey,
    approvals: systemAdminApprovalsSurfaceKey,
  } as const;
}
