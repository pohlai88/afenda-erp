import {
  appCapabilities,
  isAppCapability,
  type AppCapability,
} from "@afenda/auth";

export type SystemAdminCatalogOption<TValue extends string = string> = {
  value: TValue;
  label: string;
  description: string;
};

function labelFromKey(key: string) {
  return key
    .split(/[.-]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const systemAdminPermissionCatalog = appCapabilities.map(
  (capability) => ({
    value: capability,
    label: labelFromKey(capability),
    description: `Catalog capability ${capability}.`,
  }),
) satisfies readonly SystemAdminCatalogOption<AppCapability>[];

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
    description: "Administrative audit evidence was exported to CSV.",
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

export const systemAdminLynxOutcomeMonitorThresholdCatalog = [
  {
    monitorId: "finance-control-watch",
    label: "Finance control watch",
    fields: [
      {
        key: "blockedRecordsWatchAbove",
        label: "Blocked records watch above",
        defaultValue: 0,
      },
      {
        key: "closeControlsWatchAbove",
        label: "Close controls watch above",
        defaultValue: 0,
      },
      {
        key: "highPriorityWorkWatchAbove",
        label: "High-priority work watch above",
        defaultValue: 0,
      },
    ],
  },
  {
    monitorId: "approval-throughput-watch",
    label: "Approval throughput watch",
    fields: [
      {
        key: "escalatedWorkWatchAbove",
        label: "Escalated work watch above",
        defaultValue: 0,
      },
      {
        key: "openProposalsWatchAbove",
        label: "Open proposals watch above",
        defaultValue: 0,
      },
      {
        key: "pendingSandboxesWatchAbove",
        label: "Pending sandboxes watch above",
        defaultValue: 0,
      },
    ],
  },
  {
    monitorId: "audit-readiness-watch",
    label: "Audit readiness watch",
    fields: [
      {
        key: "minimumEvidenceDocuments",
        label: "Minimum evidence documents",
        defaultValue: 1,
      },
    ],
  },
] as const;

export type SystemAdminLynxOutcomeMonitorId =
  (typeof systemAdminLynxOutcomeMonitorThresholdCatalog)[number]["monitorId"];

export type SystemAdminLynxOutcomeMonitorThresholdKey =
  (typeof systemAdminLynxOutcomeMonitorThresholdCatalog)[number]["fields"][number]["key"];

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

export function isSystemAdminPermissionKey(
  value: string,
): value is AppCapability {
  return isAppCapability(value);
}

export function getSystemAdminLynxOutcomeMonitorThresholdCatalog(
  monitorId: string,
) {
  return systemAdminLynxOutcomeMonitorThresholdCatalog.find(
    (entry) => entry.monitorId === monitorId,
  );
}
