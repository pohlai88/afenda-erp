import type { AppCapability } from "@afenda/auth";
import { systemAdminRoutePaths } from "./system-admin.route-paths.contract";

type SystemAdminNavCapability = Extract<AppCapability, `system-admin.${string}`>;

export type SystemAdminNavItem = {
  href: string;
  label: string;
  exact?: boolean;
  requiredCapabilities: readonly SystemAdminNavCapability[];
};

export const systemAdminNavItems = [
  {
    href: systemAdminRoutePaths.hub,
    label: "Hub",
    exact: true,
    requiredCapabilities: ["system-admin.view"],
  },
  {
    href: systemAdminRoutePaths.identity,
    label: "Identity",
    requiredCapabilities: [
      "system-admin.identity.read",
      "system-admin.users.read",
    ],
  },
  {
    href: systemAdminRoutePaths.users,
    label: "Users",
    requiredCapabilities: [
      "system-admin.users.read",
      "system-admin.identity.read",
    ],
  },
  {
    href: systemAdminRoutePaths.memberships,
    label: "Memberships",
    requiredCapabilities: [
      "system-admin.memberships.read",
      "system-admin.identity.read",
    ],
  },
  {
    href: systemAdminRoutePaths.roles,
    label: "Roles",
    requiredCapabilities: [
      "system-admin.roles.read",
      "system-admin.identity.read",
    ],
  },
  {
    href: systemAdminRoutePaths.permissions,
    label: "Permissions",
    requiredCapabilities: [
      "system-admin.permissions.read",
      "system-admin.identity.read",
    ],
  },
  {
    href: systemAdminRoutePaths.modules,
    label: "Modules",
    requiredCapabilities: [
      "system-admin.modules.read",
      "system-admin.settings.read",
    ],
  },
  {
    href: systemAdminRoutePaths.capabilities,
    label: "Capabilities",
    requiredCapabilities: [
      "system-admin.capabilities.read",
      "system-admin.settings.read",
    ],
  },
  {
    href: systemAdminRoutePaths.dataManagement,
    label: "Data Management",
    requiredCapabilities: [
      "system-admin.data-management.read",
      "system-admin.diagnostics.read",
    ],
  },
  {
    href: systemAdminRoutePaths.policies,
    label: "Policies",
    requiredCapabilities: [
      "system-admin.policies.read",
      "system-admin.policies.review",
      "system-admin.settings.read",
    ],
  },
  {
    href: systemAdminRoutePaths.approvals,
    label: "Approvals",
    requiredCapabilities: [
      "system-admin.approvals.read",
      "system-admin.approvals.review",
      "system-admin.settings.read",
    ],
  },
  {
    href: systemAdminRoutePaths.audit,
    label: "Audit",
    requiredCapabilities: ["system-admin.audit.read"],
  },
  {
    href: systemAdminRoutePaths.security,
    label: "Security",
    requiredCapabilities: [
      "system-admin.security.read",
      "system-admin.settings.read",
    ],
  },
  {
    href: systemAdminRoutePaths.organization,
    label: "Organization",
    requiredCapabilities: [
      "system-admin.organization.read",
      "system-admin.settings.read",
    ],
  },
  {
    href: systemAdminRoutePaths.integrations,
    label: "Integrations",
    requiredCapabilities: ["system-admin.integrations.read"],
  },
  {
    href: systemAdminRoutePaths.lynx,
    label: "Lynx",
    requiredCapabilities: ["system-admin.lynx.read"],
  },
  {
    href: systemAdminRoutePaths.diagnostics,
    label: "Diagnostics",
    requiredCapabilities: [
      "system-admin.diagnostics.read",
      "system-admin.reliability.read",
      "system-admin.billing.read",
    ],
  },
  {
    href: systemAdminRoutePaths.reliability,
    label: "Reliability",
    requiredCapabilities: ["system-admin.reliability.read"],
  },
  {
    href: systemAdminRoutePaths.billing,
    label: "Billing",
    requiredCapabilities: ["system-admin.billing.read"],
  },
] as const satisfies readonly SystemAdminNavItem[];

export function resolveSystemAdminNavItems(
  capabilities: readonly AppCapability[],
) {
  const capabilitySet = new Set(capabilities);

  return systemAdminNavItems.filter((item) =>
    item.requiredCapabilities.some((required) => capabilitySet.has(required)),
  );
}
