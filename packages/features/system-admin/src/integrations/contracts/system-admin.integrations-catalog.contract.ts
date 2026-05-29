import type { SystemAdminCatalogOption } from "../../permissions/contracts/system-admin.permission-catalog.contract";

export const systemAdminApiScopes = [
  {
    value: "erp.read",
    label: "ERP read",
    description: "Read tenant ERP records through approved API handlers.",
  },
  {
    value: "erp.write",
    label: "ERP write",
    description:
      "Request tenant ERP mutations through approved command services.",
  },
  {
    value: "documents.read",
    label: "Documents read",
    description: "Read document metadata and download URLs when authorized.",
  },
  {
    value: "documents.write",
    label: "Documents write",
    description: "Create or update governed document records.",
  },
  {
    value: "system-admin.read",
    label: "System admin read",
    description:
      "Read tenant control-plane state through approved API handlers.",
  },
  {
    value: "lynx.read",
    label: "Lynx read",
    description: "Read Lynx governance and usage state.",
  },
] as const satisfies readonly SystemAdminCatalogOption[];

export type SystemAdminApiScope =
  (typeof systemAdminApiScopes)[number]["value"];

export const systemAdminWebhookEvents = [
  {
    value: "tenant.member.invited",
    label: "Member invited",
    description: "An organization invitation was created.",
  },
  {
    value: "tenant.invitation.revoked",
    label: "Invitation revoked",
    description: "An organization invitation was revoked.",
  },
  {
    value: "tenant.role.changed",
    label: "Role changed",
    description: "An organization member role was changed.",
  },
  {
    value: "tenant.role-override.changed",
    label: "Role override changed",
    description: "A tenant role capability override changed.",
  },
  {
    value: "tenant.settings.updated",
    label: "Tenant settings updated",
    description: "Tenant-level operating settings changed.",
  },
  {
    value: "tenant.api-credential.created",
    label: "API credential created",
    description: "An API credential was issued.",
  },
  {
    value: "tenant.api-credential.revoked",
    label: "API credential revoked",
    description: "An API credential was revoked.",
  },
  {
    value: "tenant.webhook.created",
    label: "Webhook created",
    description: "A webhook endpoint was registered.",
  },
  {
    value: "tenant.webhook.enabled",
    label: "Webhook enabled",
    description: "A webhook endpoint was re-enabled for delivery.",
  },
  {
    value: "tenant.webhook.disabled",
    label: "Webhook disabled",
    description: "A webhook endpoint was disabled and will not receive events.",
  },
  {
    value: "tenant.sso.updated",
    label: "SSO config updated",
    description: "A staged SSO connection changed.",
  },
  {
    value: "tenant.retention.updated",
    label: "Retention updated",
    description: "A tenant retention policy changed.",
  },
  {
    value: "system-admin.module-settings.updated",
    label: "Module settings updated",
    description: "Tenant module visibility or readiness changed.",
  },
  {
    value: "system-admin.capability-settings.updated",
    label: "Capability settings updated",
    description: "Tenant capability availability changed.",
  },
  {
    value: "system-admin.policy.updated",
    label: "Policy updated",
    description: "Tenant policy configuration changed.",
  },
  {
    value: "system-admin.policy_rule.create",
    label: "Policy rule created",
    description: "A tenant execution policy rule was created.",
  },
  {
    value: "system-admin.policy_rule.update",
    label: "Policy rule updated",
    description: "A tenant execution policy rule was updated.",
  },
  {
    value: "system-admin.approval.updated",
    label: "Approval updated",
    description: "Tenant approval configuration changed.",
  },
  {
    value: "system-admin.approval_rule.create",
    label: "Approval rule created",
    description: "A tenant approval rule was created.",
  },
  {
    value: "system-admin.approval_rule.update",
    label: "Approval rule updated",
    description: "A tenant approval rule was updated.",
  },
  {
    value: "system-admin.audit.view",
    label: "Audit viewer opened",
    description: "An operator reviewed the administrative audit log.",
  },
  {
    value: "system-admin.audit.export",
    label: "Audit evidence exported",
    description:
      "Administrative audit evidence was exported (CSV, JSON, Excel, or PDF).",
  },
  {
    value: "system-admin.audit.review",
    label: "Audit retention reviewed",
    description:
      "Retention policy or legal-hold posture was updated in the audit viewer.",
  },
  {
    value: "system-admin.security.view",
    label: "Security posture reviewed",
    description: "An operator reviewed organization security posture.",
  },
  {
    value: "system-admin.security.updated",
    label: "Security updated",
    description: "Tenant security posture changed.",
  },
  {
    value: "system-admin.security.update",
    label: "Security settings update",
    description: "Organization security posture was updated.",
  },
  {
    value: "system-admin.security.domain.add",
    label: "Allowed domain added",
    description: "A trusted invite domain was added.",
  },
  {
    value: "system-admin.security.domain.remove",
    label: "Allowed domain removed",
    description: "A trusted invite domain was removed.",
  },
  {
    value: "system-admin.security.mfa_requirement.update",
    label: "MFA requirement updated",
    description: "Admin MFA requirement changed.",
  },
  {
    value: "system-admin.security.session_policy.update",
    label: "Session policy updated",
    description: "Session max age or idle timeout changed.",
  },
  {
    value: "system-admin.integrations.view",
    label: "Integrations reviewed",
    description: "An operator reviewed external connectivity posture.",
  },
  {
    value: "system-admin.integration.credentials.create",
    label: "API credential created",
    description: "A new API credential was issued (secret shown once).",
  },
  {
    value: "system-admin.integration.credentials.revoke",
    label: "API credential revoked",
    description: "An API credential was revoked.",
  },
  {
    value: "system-admin.integration.webhook.create",
    label: "Webhook registered",
    description: "An outbound webhook endpoint was registered.",
  },
  {
    value: "system-admin.integration.enable",
    label: "Webhook enabled",
    description: "An outbound webhook endpoint was enabled.",
  },
  {
    value: "system-admin.integration.disable",
    label: "Webhook disabled",
    description: "An outbound webhook endpoint was disabled.",
  },
  {
    value: "system-admin.integration.sso.update",
    label: "SSO connection updated",
    description: "Staged SSO metadata was updated.",
  },
  {
    value: "system-admin.organization.updated",
    label: "Organization updated",
    description: "Tenant organization defaults changed.",
  },
  {
    value: "lynx.sandbox.approved",
    label: "Lynx sandbox approved",
    description: "A machine action sandbox was approved.",
  },
  {
    value: "lynx.sandbox.rejected",
    label: "Lynx sandbox rejected",
    description: "A machine action sandbox was rejected.",
  },
] as const satisfies readonly SystemAdminCatalogOption[];

export type SystemAdminWebhookEvent =
  (typeof systemAdminWebhookEvents)[number]["value"];

/** Suggested filters when registering a new outbound webhook endpoint. */
export const systemAdminDefaultWebhookEventPresets = [
  "tenant.webhook.created",
  "tenant.webhook.enabled",
  "tenant.webhook.disabled",
] as const satisfies readonly SystemAdminWebhookEvent[];

const apiScopeSet = new Set<string>(
  systemAdminApiScopes.map((scope) => scope.value),
);
const webhookEventSet = new Set<string>(
  systemAdminWebhookEvents.map((event) => event.value),
);

export function isSystemAdminApiScope(
  value: string,
): value is SystemAdminApiScope {
  return apiScopeSet.has(value);
}

export function isSystemAdminWebhookEvent(
  value: string,
): value is SystemAdminWebhookEvent {
  return webhookEventSet.has(value);
}
