import type { AppCapability } from "@afenda/kernel";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

export type SystemAdminCapability = Extract<
  AppCapability,
  `system-admin.${string}`
>;

export type SystemAdminExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
};

export function toSystemAdminExecutionGuard(
  context: ExecutionContext,
): SystemAdminExecutionGuard {
  return {
    context,
    session: { id: context.userId },
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
      locale: context.locale,
      role: context.role,
      capabilities: context.capabilities,
    },
  };
}

export async function requireSystemAdminAnyCapability(
  capabilities: readonly SystemAdminCapability[],
) {
  const requiredCapability = capabilities[0];
  if (!requiredCapability) {
    throw new Error("At least one System Admin capability is required.");
  }

  const context = await requireExecutionContext();

  if (
    capabilities.some((capability) =>
      hasExecutionPermission(context, capability),
    )
  ) {
    return toSystemAdminExecutionGuard(context);
  }

  requireExecutionPermission(context, requiredCapability);
  return toSystemAdminExecutionGuard(context);
}

export function hasSystemAdminAnyCapability(
  context: ExecutionContext,
  capabilities: readonly SystemAdminCapability[],
) {
  return capabilities.some((capability) =>
    hasExecutionPermission(context, capability),
  );
}

export function requireSystemAdminCapability(capability: SystemAdminCapability) {
  return requireSystemAdminAnyCapability([capability]);
}

export function requireSystemAdminRead() {
  return requireSystemAdminAnyCapability(["system-admin.view"]);
}

export function requireSystemAdminUsersRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.users.read",
    "system-admin.identity.read",
  ]);
}

export function requireSystemAdminUsersManage() {
  return requireSystemAdminAnyCapability([
    "system-admin.users.manage",
    "system-admin.identity.write",
  ]);
}

export function requireSystemAdminMembershipsRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.memberships.read",
    "system-admin.identity.read",
  ]);
}

export function requireSystemAdminMembershipsManage() {
  return requireSystemAdminAnyCapability([
    "system-admin.memberships.manage",
    "system-admin.identity.write",
  ]);
}

export function requireSystemAdminRolesRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.roles.read",
    "system-admin.identity.read",
  ]);
}

export function requireSystemAdminRolesManage() {
  return requireSystemAdminAnyCapability([
    "system-admin.roles.manage",
    "system-admin.identity.write",
  ]);
}

export function requireSystemAdminPermissionsRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.permissions.read",
    "system-admin.identity.read",
  ]);
}

export function requireSystemAdminPermissionsManage() {
  return requireSystemAdminAnyCapability([
    "system-admin.permissions.manage",
    "system-admin.identity.write",
  ]);
}

export function requireSystemAdminModulesRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.modules.read",
    "system-admin.settings.read",
  ]);
}

export function requireSystemAdminModulesManage() {
  return requireSystemAdminAnyCapability([
    "system-admin.modules.manage",
    "system-admin.settings.write",
  ]);
}

export function requireSystemAdminCapabilitiesRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.capabilities.read",
    "system-admin.settings.read",
  ]);
}

export function requireSystemAdminCapabilitiesManage() {
  return requireSystemAdminAnyCapability([
    "system-admin.capabilities.manage",
    "system-admin.settings.write",
  ]);
}

export function requireSystemAdminPoliciesRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.policies.read",
    "system-admin.policies.review",
    "system-admin.settings.read",
  ]);
}

export function requireSystemAdminPoliciesReview() {
  return requireSystemAdminAnyCapability([
    "system-admin.policies.review",
    "system-admin.policies.read",
    "system-admin.policies.manage",
    "system-admin.settings.read",
  ]);
}

export function requireSystemAdminPoliciesManage() {
  return requireSystemAdminAnyCapability([
    "system-admin.policies.manage",
    "system-admin.settings.write",
  ]);
}

export function requireSystemAdminApprovalsRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.approvals.read",
    "system-admin.approvals.review",
    "system-admin.settings.read",
  ]);
}

export function requireSystemAdminApprovalsReview() {
  return requireSystemAdminCapability("system-admin.approvals.review");
}

export function requireSystemAdminApprovalsManage() {
  return requireSystemAdminAnyCapability([
    "system-admin.approvals.manage",
    "system-admin.settings.write",
  ]);
}

export function requireSystemAdminSecurityRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.security.read",
    "system-admin.settings.read",
  ]);
}

export function requireSystemAdminSecurityManage() {
  return requireSystemAdminAnyCapability([
    "system-admin.security.manage",
    "system-admin.settings.write",
  ]);
}

export function requireSystemAdminOrganizationRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.organization.read",
    "system-admin.settings.read",
  ]);
}

export function requireSystemAdminOrganizationManage() {
  return requireSystemAdminAnyCapability([
    "system-admin.organization.manage",
    "system-admin.settings.write",
  ]);
}

export function requireSystemAdminDiagnosticsRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.diagnostics.read",
    "system-admin.reliability.read",
    "system-admin.billing.read",
  ]);
}

export function requireSystemAdminDataManagementRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.data-management.read",
    "system-admin.diagnostics.read",
    "system-admin.reliability.read",
  ]);
}

export function requireSystemAdminDataManagementManage() {
  return requireSystemAdminAnyCapability([
    "system-admin.data-management.manage",
    "system-admin.settings.write",
  ]);
}

export function requireSystemAdminDataManagementRun() {
  return requireSystemAdminCapability("system-admin.data-management.run");
}

export function requireSystemAdminDataManagementCancel() {
  return requireSystemAdminCapability("system-admin.data-management.cancel");
}

export function requireSystemAdminDataManagementExport() {
  return requireSystemAdminCapability("system-admin.data-management.export");
}

export function requireSystemAdminAuditRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.audit.read",
    "system-admin.settings.read",
  ]);
}

export function requireSystemAdminAuditExport() {
  return requireSystemAdminCapability("system-admin.audit.export");
}

export function requireSystemAdminAuditReview() {
  return requireSystemAdminCapability("system-admin.audit.review");
}

export function requireSystemAdminIdentityWrite() {
  return requireSystemAdminAnyCapability([
    "system-admin.users.manage",
    "system-admin.memberships.manage",
    "system-admin.roles.manage",
    "system-admin.permissions.manage",
    "system-admin.identity.write",
  ]);
}

export function requireSystemAdminIntegrationsWrite() {
  return requireSystemAdminAnyCapability([
    "system-admin.integrations.write",
    "system-admin.settings.write",
  ]);
}

export {
  requireSystemAdminLynxApprove,
  requireSystemAdminLynxRead,
} from "../lynx/sys-lynx.policy.server";

export function requireSystemAdminIntegrationsRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.integrations.read",
    "system-admin.settings.read",
  ]);
}

export function requireSystemAdminReliabilityRead() {
  return requireSystemAdminAnyCapability([
    "system-admin.reliability.read",
    "system-admin.diagnostics.read",
  ]);
}

export function requireSystemAdminBillingRead() {
  return requireSystemAdminCapability("system-admin.billing.read");
}
