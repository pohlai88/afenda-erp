/**
 * Canonical map: URL section slug → route adapter → feature package area.
 *
 * Routing: `apps/erp/.../[moduleId]/[...section]/page.tsx` reads `section[0]`,
 * resolves a slug here, then loads the matching `*.server.tsx` adapter.
 *
 * To find what renders for `/system-admin/audit`, open `audit` below, then
 * `audit.server.tsx`, then the listed `featureArea` under
 * `packages/features/system-admin/src/`.
 */
export const systemAdminSectionManifest = {
  approvals: {
    label: "Approval rules",
    featureArea: "approvals",
  },
  audit: {
    label: "Audit viewer",
    featureArea: "audit-viewer",
  },
  billing: {
    label: "Billing",
    featureArea: "billing",
  },
  capabilities: {
    label: "Capabilities",
    featureArea: "capabilities",
  },
  "data-management": {
    label: "Data management",
    featureArea: "data-management",
  },
  diagnostics: {
    label: "Diagnostics hub",
    featureArea: "diagnostics",
  },
  identity: {
    label: "Identity & overrides",
    featureArea: "users",
  },
  integrations: {
    label: "Integrations",
    featureArea: "integrations",
  },
  lynx: {
    label: "Lynx",
    featureArea: "lynx",
  },
  memberships: {
    label: "Memberships",
    featureArea: "memberships",
  },
  modules: {
    label: "Modules",
    featureArea: "modules",
  },
  organization: {
    label: "Organization",
    featureArea: "organization",
  },
  permissions: {
    label: "Permissions",
    featureArea: "permissions",
  },
  policies: {
    label: "Policies",
    featureArea: "policies",
  },
  reliability: {
    label: "Reliability",
    featureArea: "reliability",
  },
  roles: {
    label: "Roles",
    featureArea: "roles",
  },
  security: {
    label: "Security",
    featureArea: "security",
  },
  users: {
    label: "Users",
    featureArea: "users",
  },
} as const;

export type SystemAdminSectionSlug = keyof typeof systemAdminSectionManifest;

export function describeSystemAdminSection(slug: SystemAdminSectionSlug) {
  const entry = systemAdminSectionManifest[slug];
  return {
    slug,
    url: `/system-admin/${slug}`,
    label: entry.label,
    adapterFile: `apps/erp/src/lib/system-admin-sections/${slug}.server.tsx`,
    featureRoot: `packages/features/system-admin/src/${entry.featureArea}`,
    featurePackage: "@afenda/feature-system-admin",
  };
}
