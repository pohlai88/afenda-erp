import { systemAdminAuditLogSurfaceKey, systemAdminRetentionSurfaceKey } from "./audit/surfaces";
import {
  systemAdminInvitationsSurfaceKey,
  systemAdminMembersSurfaceKey,
  systemAdminRoleOverridesSurfaceKey,
} from "./identity/surfaces";
import {
  systemAdminApiCredentialsSurfaceKey,
  systemAdminSsoSurfaceKey,
  systemAdminWebhookDeliveriesSurfaceKey,
  systemAdminWebhooksSurfaceKey,
} from "./integrations/surfaces";
import {
  systemAdminAiApprovalsSurfaceKey,
  systemAdminAiSandboxesSurfaceKey,
  systemAdminAiEntitlementsSurfaceKey,
  systemAdminAiUsageSurfaceKey,
} from "./machine-layer/surfaces";
import { systemAdminGatewaySpendSurfaceKey } from "./machine-layer/spend-surfaces";
import { systemAdminBillingSurfaceKey } from "./billing/surfaces";
import { systemAdminCronSurfaceKey } from "./reliability/surfaces";
import { systemAdminSettingsSurfaceKey } from "./settings/surfaces";

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
