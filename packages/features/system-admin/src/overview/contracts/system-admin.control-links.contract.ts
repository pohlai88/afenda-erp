import { systemAdminRoutePaths } from "./system-admin.route-paths.contract";

export function systemAdminListHref(
  path: string,
  scope: string,
  query?: string,
) {
  if (!query) {
    return path;
  }

  const params = new URLSearchParams();
  params.set(`${scope}Q`, query);
  return `${path}?${params.toString()}`;
}

export const systemAdminControlLinks = {
  permissions: (query?: string) =>
    systemAdminListHref(systemAdminRoutePaths.permissions, "permissions", query),
  modules: (query?: string) =>
    systemAdminListHref(systemAdminRoutePaths.modules, "modules", query),
  capabilities: (query?: string) =>
    systemAdminListHref(
      systemAdminRoutePaths.capabilities,
      "capabilities",
      query,
    ),
  policies: (query?: string) =>
    systemAdminListHref(systemAdminRoutePaths.policies, "policies", query),
  policy: (policyKey: string, query?: string) => {
    const params = new URLSearchParams();
    params.set("policiesKey", policyKey);
    if (query) {
      params.set("policiesQ", query);
    }
    return `${systemAdminRoutePaths.policies}?${params.toString()}`;
  },
  approvals: (query?: string) =>
    systemAdminListHref(systemAdminRoutePaths.approvals, "approvals", query),
  audit: (query?: string) =>
    systemAdminListHref(systemAdminRoutePaths.audit, "audit", query),
  security: () => systemAdminRoutePaths.security,
  organization: () => systemAdminRoutePaths.organization,
  roles: () => systemAdminRoutePaths.roles,
  users: () => systemAdminRoutePaths.users,
  identity: () => systemAdminRoutePaths.identity,
} as const;
