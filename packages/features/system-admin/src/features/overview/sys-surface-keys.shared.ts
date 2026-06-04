import { systemAdminAuditViewerSurfaceKey } from "../audit-viewer/sys-audit-list.surface";
import { systemAdminRetentionSurfaceKey } from "../audit-viewer/sys-retention-list.surface";
import { systemAdminSecurityRecentChangesSurfaceKey } from "../security/sys-security-recent-changes.surface";
import { systemAdminSecuritySurfaceKey } from "../security/sys-security-list.surface";
import { systemAdminUsersSurfaceKey } from "../users/sys-users-list.surface";
import { systemAdminMembersSurfaceKey } from "../memberships/sys-memberships-list.surface";
import { systemAdminRoleOverridesSurfaceKey } from "../permissions/sys-role-overrides-list.surface";
import { systemAdminApiCredentialsSurfaceKey, systemAdminSsoSurfaceKey, systemAdminWebhookDeliveriesSurfaceKey, systemAdminWebhooksSurfaceKey } from "../integrations/sys-integrations-list.surface";
import { systemAdminIntegrationsGovernanceSurfaceKey } from "../integrations/sys-integrations-governance.surface";
import { systemAdminIntegrationsRecentChangesSurfaceKey } from "../integrations/sys-integrations-recent-changes.surface";
import { systemAdminAiApprovalsSurfaceKey, systemAdminAiEntitlementsSurfaceKey, systemAdminAiSandboxesSurfaceKey, systemAdminAiUsageSurfaceKey } from "../lynx/sys-lynx.surface";
import { systemAdminGatewaySpendSurfaceKey } from "../lynx/sys-gateway-spend.surface";
import { systemAdminBillingContactsSurfaceKey } from "../billing/sys-billing-contacts.surface";
import { systemAdminBillingEntitlementsSurfaceKey } from "../billing/sys-billing-entitlements.surface";
import { systemAdminBillingGovernanceSurfaceKey, systemAdminBillingSurfaceKey } from "../billing/sys-billing-governance.surface";
import { systemAdminBillingInvoicesSurfaceKey } from "../billing/sys-billing-invoices.surface";
import { systemAdminBillingPaymentsSurfaceKey } from "../billing/sys-billing-payments.surface";
import { systemAdminBillingSubscriptionSurfaceKey } from "../billing/sys-billing-subscription.surface";
import { systemAdminBillingUsageSurfaceKey } from "../billing/sys-billing-usage.surface";
import { systemAdminCronSurfaceKey } from "../reliability/sys-cron-health.surface";
import { systemAdminReliabilityOperationalLinksSurfaceKey, systemAdminReliabilitySurfaceKey } from "../reliability/sys-reliability-list.surface";
import { systemAdminCapabilitiesSurfaceKey } from "../capabilities/sys-capabilities-list.surface";
import { systemAdminModulesSurfaceKey } from "../modules/sys-modules-list.surface";
import { systemAdminOrganizationSurfaceKey } from "../organization/sys-organization-list.surface";
import { systemAdminPermissionsSurfaceKey } from "../permissions/sys-permissions-list.surface";
import { systemAdminRolesSurfaceKey } from "../roles/sys-roles-list.surface";
import { systemAdminDiagnosticsModuleCoverageSurfaceKey, systemAdminDiagnosticsRecentChangesSurfaceKey, systemAdminDiagnosticsSurfaceKey } from "../diagnostics/sys-diagnostics-list.surface";
import { systemAdminApprovalsSurfaceKey } from "../approvals/sys-approvals-list.surface";
import { systemAdminPoliciesSurfaceKey } from "../policies/system-admin.policy-rules.surface";

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
