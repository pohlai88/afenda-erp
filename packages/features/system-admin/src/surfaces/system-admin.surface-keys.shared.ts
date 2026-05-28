import { systemAdminAuditViewerSurfaceKey } from "../audit-viewer/data/system-admin.audit.surface";
import { systemAdminRetentionSurfaceKey } from "../audit-viewer/data/system-admin.retention.surface";
import { systemAdminSecuritySurfaceKey } from "../security/data/system-admin.security.surface";
import {
  systemAdminInvitationsSurfaceKey,
  systemAdminMembersSurfaceKey,
  systemAdminRoleOverridesSurfaceKey,
} from "./system-admin.identity.surface";
import {
  systemAdminApiCredentialsSurfaceKey,
  systemAdminSsoSurfaceKey,
  systemAdminWebhookDeliveriesSurfaceKey,
  systemAdminWebhooksSurfaceKey,
} from "./system-admin.integrations.surface";
import {
  systemAdminAiApprovalsSurfaceKey,
  systemAdminAiSandboxesSurfaceKey,
  systemAdminAiEntitlementsSurfaceKey,
  systemAdminAiUsageSurfaceKey,
} from "./system-admin.machine-layer.surface";
import { systemAdminGatewaySpendSurfaceKey } from "./system-admin.gateway-spend.surface";
import { systemAdminBillingSurfaceKey } from "./system-admin.billing.surface";
import { systemAdminCronSurfaceKey } from "./system-admin.cron-health.surface";
import { systemAdminSettingsSurfaceKey } from "./system-admin.settings.surface";
import {
  systemAdminCapabilitiesSurfaceKey,
  systemAdminDiagnosticsSurfaceKey,
  systemAdminModulesSurfaceKey,
  systemAdminOrganizationSurfaceKey,
  systemAdminPermissionsSurfaceKey,
} from "./system-admin.control.surface";
import {
  systemAdminDiagnosticsModuleCoverageSurfaceKey,
  systemAdminDiagnosticsRecentChangesSurfaceKey,
} from "../diagnostics/data/system-admin.diagnostics.surface";
import { systemAdminApprovalsSurfaceKey } from "../approvals/data/system-admin.approval-rules.surface";
import { systemAdminPoliciesSurfaceKey } from "../policies/data/system-admin.policy-rules.surface";

export {
  systemAdminAuditViewerSurfaceKey,
  systemAdminRetentionSurfaceKey,
  systemAdminSecuritySurfaceKey,
  systemAdminInvitationsSurfaceKey,
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
  systemAdminSettingsSurfaceKey,
  systemAdminCronSurfaceKey,
  systemAdminBillingSurfaceKey,
  systemAdminModulesSurfaceKey,
  systemAdminCapabilitiesSurfaceKey,
  systemAdminPermissionsSurfaceKey,
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
    invitations: systemAdminInvitationsSurfaceKey,
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
    settings: systemAdminSettingsSurfaceKey,
    cron: systemAdminCronSurfaceKey,
    billing: systemAdminBillingSurfaceKey,
    modules: systemAdminModulesSurfaceKey,
    capabilities: systemAdminCapabilitiesSurfaceKey,
    permissions: systemAdminPermissionsSurfaceKey,
    organization: systemAdminOrganizationSurfaceKey,
    diagnostics: systemAdminDiagnosticsSurfaceKey,
    diagnosticsModuleCoverage: systemAdminDiagnosticsModuleCoverageSurfaceKey,
    diagnosticsRecentChanges: systemAdminDiagnosticsRecentChangesSurfaceKey,
    policies: systemAdminPoliciesSurfaceKey,
    approvals: systemAdminApprovalsSurfaceKey,
  } as const;
}
