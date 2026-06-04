import { systemAdminRoutePaths } from "./sys-route-paths.contract";

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
  dataManagement: (query?: string) =>
    systemAdminListHref(
      systemAdminRoutePaths.dataManagement,
      "importJobs",
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
  approval: (approvalKey: string, query?: string) => {
    const params = new URLSearchParams();
    params.set("approvalsKey", approvalKey);
    if (query) {
      params.set("approvalsQ", query);
    }
    return `${systemAdminRoutePaths.approvals}?${params.toString()}`;
  },
  audit: (query?: string) =>
    systemAdminListHref(systemAdminRoutePaths.audit, "audit", query),
  security: () => systemAdminRoutePaths.security,
  integrations: () => systemAdminRoutePaths.integrations,
  organization: () => systemAdminRoutePaths.organization,
  roles: () => systemAdminRoutePaths.roles,
  users: () => systemAdminRoutePaths.users,
  identity: () => systemAdminRoutePaths.identity,
} as const;
