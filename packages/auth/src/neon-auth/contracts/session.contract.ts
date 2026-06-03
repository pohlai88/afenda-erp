export const organizationRoles = [
  "owner",
  "admin",
  "finance-manager",
  "operations-manager",
  "staff",
  "viewer",
] as const;

export type OrganizationRole = (typeof organizationRoles)[number];

const declaredAppCapabilities = [
  "dashboard.view",
  "finance.view",
  "sales.view",
  "purchasing.view",
  "inventory.view",
  "hr.view",
  "crm.view",
  "approvals.view",
  "approvals.decide",
  "reports.view",
  "system-admin.view",
  "system-admin.identity.read",
  "system-admin.identity.write",
  "system-admin.users.read",
  "system-admin.users.manage",
  "system-admin.memberships.read",
  "system-admin.memberships.manage",
  "system-admin.roles.read",
  "system-admin.roles.manage",
  "system-admin.permissions.read",
  "system-admin.permissions.manage",
  "system-admin.modules.read",
  "system-admin.modules.manage",
  "system-admin.capabilities.read",
  "system-admin.capabilities.manage",
  "system-admin.data-management.read",
  "system-admin.data-management.manage",
  "system-admin.data-management.run",
  "system-admin.data-management.cancel",
  "system-admin.data-management.export",
  "system-admin.policies.read",
  "system-admin.policies.review",
  "system-admin.policies.manage",
  "system-admin.approvals.read",
  "system-admin.approvals.review",
  "system-admin.approvals.manage",
  "system-admin.settings.read",
  "system-admin.settings.write",
  "system-admin.audit.read",
  "system-admin.audit.review",
  "system-admin.audit.export",
  "system-admin.security.read",
  "system-admin.security.manage",
  "system-admin.organization.read",
  "system-admin.organization.manage",
  "system-admin.integrations.read",
  "system-admin.integrations.write",
  "system-admin.lynx.read",
  "system-admin.lynx.approve",
  "system-admin.reliability.read",
  "system-admin.billing.read",
  "system-admin.billing.manage",
  "system-admin.billing.export",
  "system-admin.diagnostics.read",
] as const;

export type DeclaredAppCapability = (typeof declaredAppCapabilities)[number];

export type AppCapability =
  | DeclaredAppCapability
  | `hr.${string}`
  | `system-admin.${string}`
  | `${string}.documents.read`
  | `${string}.documents.write`
  | `${string}.view`
  | `${string}.write`
  | `${string}.manage`
  | `${string}.read`
  | `${string}.approve`;

export const appCapabilities: readonly AppCapability[] =
  declaredAppCapabilities;

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  membershipId: string;
  role: OrganizationRole;
  locale: string;
  capabilities: readonly AppCapability[];
};

export type UserSession = {
  source: "dev" | "neon";
  id: string;
  name: string;
  email: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  organizations: readonly OrganizationSummary[];
  activeOrganizationId: string | null;
};

const roleCapabilityMap = {
  owner: appCapabilities,
  admin: appCapabilities,
  "finance-manager": [
    "dashboard.view",
    "finance.view",
    "approvals.view",
    "reports.view",
    "system-admin.view",
    "system-admin.approvals.read",
    "system-admin.audit.read",
    "system-admin.lynx.read",
  ],
  "operations-manager": [
    "dashboard.view",
    "sales.view",
    "purchasing.view",
    "inventory.view",
    "crm.view",
    "approvals.view",
    "reports.view",
    "system-admin.view",
    "system-admin.approvals.read",
    "system-admin.lynx.read",
  ],
  staff: [
    "dashboard.view",
    "sales.view",
    "purchasing.view",
    "inventory.view",
    "crm.view",
    "approvals.view",
    "reports.view",
    "system-admin.lynx.read",
  ],
  viewer: [
    "dashboard.view",
    "reports.view",
    "system-admin.lynx.read",
  ],
} as const satisfies Record<OrganizationRole, readonly AppCapability[]>;

export function isAppCapability(value: string): value is AppCapability {
  return value.trim().length > 0;
}

export function isOrganizationRole(value: string): value is OrganizationRole {
  return organizationRoles.includes(value as OrganizationRole);
}

export function getCapabilitiesForOrganizationRole(
  role: OrganizationRole,
): readonly AppCapability[] {
  return roleCapabilityMap[role];
}

export function capabilitiesForRole(
  role: OrganizationRole,
): readonly AppCapability[] {
  return getCapabilitiesForOrganizationRole(role);
}

export function documentReadCapability(moduleId: string): AppCapability | null {
  const documentCapability = `${moduleId}.documents.read` as AppCapability;
  if (isAppCapability(documentCapability)) return documentCapability;
  const viewCapability = `${moduleId}.view` as AppCapability;
  return isAppCapability(viewCapability) ? viewCapability : null;
}

export function documentWriteCapability(moduleId: string): AppCapability | null {
  const documentCapability = `${moduleId}.documents.write` as AppCapability;
  if (isAppCapability(documentCapability)) return documentCapability;
  const writeCapability = `${moduleId}.write` as AppCapability;
  return isAppCapability(writeCapability) ? writeCapability : null;
}

export function hasDocumentReadAccess(
  capabilities: readonly AppCapability[],
  moduleId: string,
) {
  const capability = documentReadCapability(moduleId);
  return Boolean(
    capability &&
      (capabilities.includes(capability) ||
        capabilities.includes(`${moduleId}.view` as AppCapability)),
  );
}

export function hasDocumentWriteAccess(
  capabilities: readonly AppCapability[],
  moduleId: string,
) {
  const capability = documentWriteCapability(moduleId);
  return Boolean(capability && capabilities.includes(capability));
}

export function getActiveOrganization(
  session: UserSession,
): OrganizationSummary | null {
  return (
    session.organizations.find(
      (organization) => organization.id === session.activeOrganizationId,
    ) ??
    session.organizations[0] ??
    null
  );
}
