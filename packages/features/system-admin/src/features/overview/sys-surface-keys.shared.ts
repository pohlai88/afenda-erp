import { systemAdminAuditViewerSurfaceKey } from "../../audit-viewer/surface/system-admin.audit-list.surface";
import { systemAdminRetentionSurfaceKey } from "../../audit-viewer/surface/system-admin.retention-list.surface";
import {
  systemAdminSecurityRecentChangesSurfaceKey,
  systemAdminSecuritySurfaceKey,
} from "../../security/surface";
import { systemAdminUsersSurfaceKey } from "../../users/surface/system-admin.users-list.surface";
import { systemAdminMembersSurfaceKey } from "../../memberships/surface/system-admin.memberships-list.surface";
import { systemAdminRoleOverridesSurfaceKey } from "../../permissions/surface/system-admin.role-overrides-list.surface";
import {
  systemAdminApiCredentialsSurfaceKey,
  systemAdminIntegrationsGovernanceSurfaceKey,
  systemAdminIntegrationsRecentChangesSurfaceKey,
  systemAdminSsoSurfaceKey,
  systemAdminWebhookDeliveriesSurfaceKey,
  systemAdminWebhooksSurfaceKey,
} from "../../integrations/surface";
import {
  systemAdminAiApprovalsSurfaceKey,
  systemAdminAiEntitlementsSurfaceKey,
  systemAdminAiSandboxesSurfaceKey,
  systemAdminAiUsageSurfaceKey,
  systemAdminGatewaySpendSurfaceKey,
} from "../../lynx/surface";
import {
  systemAdminBillingContactsSurfaceKey,
  systemAdminBillingEntitlementsSurfaceKey,
  systemAdminBillingGovernanceSurfaceKey,
  systemAdminBillingInvoicesSurfaceKey,
  systemAdminBillingPaymentsSurfaceKey,
  systemAdminBillingSurfaceKey,
  systemAdminBillingSubscriptionSurfaceKey,
  systemAdminBillingUsageSurfaceKey,
} from "../../billing/surface";
import { systemAdminCronSurfaceKey } from "../../reliability/surface";
import {
  systemAdminReliabilityOperationalLinksSurfaceKey,
  systemAdminReliabilitySurfaceKey,
} from "../../reliability/surface";
import { systemAdminCapabilitiesSurfaceKey } from "../../capabilities/surface";
import { systemAdminModulesSurfaceKey } from "../../modules/surface";
import { systemAdminOrganizationSurfaceKey } from "../../organization/surface";
import { systemAdminPermissionsSurfaceKey } from "../../permissions/surface/system-admin.permissions-list.surface";
import { systemAdminRolesSurfaceKey } from "../../roles/surface";
import {
  systemAdminDiagnosticsModuleCoverageSurfaceKey,
  systemAdminDiagnosticsRecentChangesSurfaceKey,
  systemAdminDiagnosticsSurfaceKey,
} from "../../diagnostics/surface";
import { systemAdminApprovalsSurfaceKey } from "../../approvals/surface";
import { systemAdminPoliciesSurfaceKey } from "../../policies/surface";

export {
  systemAdminAuditViewerSurfaceKey,
  systemAdminRetentionSurfaceKey,
  systemAdminSecurityRecentChangesSurfaceKey,
  systemAdminSecuritySurfaceKey,
  systemAdminUsersSurfaceKey,
  systemAdminMembersSurfaceKey,
  systemAdminRoleOverridesSurfaceKey,
  systemAdminApiCredentialsSurfaceKey,
  systemAdminIntegrationsGovernanceSurfaceKey,
  systemAdminIntegrationsRecentChangesSurfaceKey,
  systemAdminSsoSurfaceKey,
  systemAdminWebhookDeliveriesSurfaceKey,
  systemAdminWebhooksSurfaceKey,
  systemAdminAiApprovalsSurfaceKey,
  systemAdminAiSandboxesSurfaceKey,
  systemAdminAiEntitlementsSurfaceKey,
  systemAdminAiUsageSurfaceKey,
  systemAdminGatewaySpendSurfaceKey,
  systemAdminCronSurfaceKey,
  systemAdminReliabilitySurfaceKey,
  systemAdminReliabilityOperationalLinksSurfaceKey,
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
    securityRecentChanges: systemAdminSecurityRecentChangesSurfaceKey,
    members: systemAdminMembersSurfaceKey,
    users: systemAdminUsersSurfaceKey,
    roleOverrides: systemAdminRoleOverridesSurfaceKey,
    apiCredentials: systemAdminApiCredentialsSurfaceKey,
    integrationsGovernance: systemAdminIntegrationsGovernanceSurfaceKey,
    integrationsRecentChanges: systemAdminIntegrationsRecentChangesSurfaceKey,
    webhooks: systemAdminWebhooksSurfaceKey,
    webhookDeliveries: systemAdminWebhookDeliveriesSurfaceKey,
    sso: systemAdminSsoSurfaceKey,
    aiUsage: systemAdminAiUsageSurfaceKey,
    aiApprovals: systemAdminAiApprovalsSurfaceKey,
    aiSandboxes: systemAdminAiSandboxesSurfaceKey,
    aiEntitlements: systemAdminAiEntitlementsSurfaceKey,
    gatewaySpend: systemAdminGatewaySpendSurfaceKey,
    cron: systemAdminCronSurfaceKey,
    reliability: systemAdminReliabilitySurfaceKey,
    reliabilityOperationalLinks: systemAdminReliabilityOperationalLinksSurfaceKey,
    billing: systemAdminBillingSurfaceKey,
    billingGovernance: systemAdminBillingGovernanceSurfaceKey,
    billingSubscription: systemAdminBillingSubscriptionSurfaceKey,
    billingUsage: systemAdminBillingUsageSurfaceKey,
    billingEntitlements: systemAdminBillingEntitlementsSurfaceKey,
    billingInvoices: systemAdminBillingInvoicesSurfaceKey,
    billingPayments: systemAdminBillingPaymentsSurfaceKey,
    billingContacts: systemAdminBillingContactsSurfaceKey,
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
