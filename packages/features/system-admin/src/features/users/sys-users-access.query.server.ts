import type { AppCapability } from "@afenda/kernel";
import {
  getTenantMembershipById,
  listTenantCapabilitySettings,
  listTenantModuleSettings,
} from "@afenda/db";
import {
  listRoleOverridesForOrganization,
  listTenantMembers,
} from "./sys-identity.repository.server";
import { getErpModuleById } from "@afenda/kernel";
import { moduleIds } from "@afenda/config/module-ids";
import { listExecutionCapabilities } from "@afenda/kernel/execution-capabilities";
import { resolveEffectivePermissionsForRole } from "../permissions/sys-permissions.query.server";
import type { SystemAdminUserAccessInspection, SystemAdminUserStatus } from "./sys-users.contract";

function membershipStatusToUserStatus(
  status: "active" | "suspended" | "removed",
): SystemAdminUserStatus {
  return status;
}

function accessImpactMessage(status: SystemAdminUserStatus) {
  if (status === "suspended") {
    return "Suspended memberships cannot access organization surfaces until reactivated.";
  }

  if (status === "removed") {
    return "Removed memberships are historical only; access is denied.";
  }

  return "Active memberships receive access through assigned roles and tenant overrides.";
}

export async function inspectSystemAdminUserAccess(input: {
  organizationId: string;
  membershipId: string;
}): Promise<SystemAdminUserAccessInspection> {
  const membership = await getTenantMembershipById({
    organizationId: input.organizationId,
    membershipId: input.membershipId,
  });

  if (!membership) {
    throw new Error("Organization membership was not found.");
  }

  const members = await listTenantMembers({
    organizationId: input.organizationId,
    limit: 500,
  });
  const memberProfile = members.find(
    (member) => member.membershipId === input.membershipId,
  );

  const [overrides, moduleSettings, capabilitySettings] = await Promise.all([
    listRoleOverridesForOrganization({
      organizationId: input.organizationId,
      limit: 500,
    }),
    listTenantModuleSettings({ organizationId: input.organizationId }),
    listTenantCapabilitySettings({ organizationId: input.organizationId }),
  ]);

  const userStatus = membershipStatusToUserStatus(membership.status);
  const assignedRoles = [membership.role] as const;
  const effectivePermissions = resolveEffectivePermissionsForRole(
    membership.role,
    overrides,
  );
  const effectivePermissionSet = new Set<AppCapability>(effectivePermissions);

  const enabledModules = moduleIds
    .map((moduleId) => getErpModuleById(moduleId))
    .filter((module) => module !== null)
    .filter((module) => {
      const setting = moduleSettings.find((row) => row.moduleKey === module.id);
      return setting?.enabled !== false;
    })
    .filter((module) => effectivePermissionSet.has(module.requiredCapability))
    .map((module) => module.label);

  const disabledCapabilityKeys = new Set(
    capabilitySettings
      .filter((setting) => setting.availability === "disabled")
      .map((setting) => setting.capabilityKey),
  );

  const executionCapabilities = listExecutionCapabilities();
  const accessibleCapabilities: string[] = [];
  const blockedCapabilities: string[] = [];

  for (const capability of executionCapabilities) {
    if (disabledCapabilityKeys.has(capability.key)) {
      blockedCapabilities.push(capability.key);
      continue;
    }

    if (effectivePermissionSet.has(capability.requiredPermission)) {
      accessibleCapabilities.push(capability.key);
      continue;
    }

    blockedCapabilities.push(capability.key);
  }

  return {
    membershipId: membership.membershipId,
    userLabel: memberProfile?.name ?? membership.authUserId,
    email: memberProfile?.email ?? membership.authUserId,
    membershipStatus: userStatus,
    assignedRoles,
    effectivePermissions,
    enabledModules,
    accessibleCapabilities,
    blockedCapabilities,
    accessImpact: accessImpactMessage(userStatus),
  };
}
