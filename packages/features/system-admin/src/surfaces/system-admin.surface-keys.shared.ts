import {
  systemAdminAuditLogSurfaceKey,
  systemAdminRetentionSurfaceKey,
} from "./system-admin.audit.surface";
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

export {
  systemAdminAuditLogSurfaceKey,
  systemAdminRetentionSurfaceKey,
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
};

export function getSystemAdminSurfaceKeys() {
  return {
    auditLog: systemAdminAuditLogSurfaceKey,
    retention: systemAdminRetentionSurfaceKey,
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
  } as const;
}
