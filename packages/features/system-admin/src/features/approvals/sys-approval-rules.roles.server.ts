import type { OrganizationRole } from "@afenda/auth";
import { listTenantRoleCatalog } from "@afenda/db";

export async function listDeprecatedOrganizationRoles(input: {
  organizationId: string;
}): Promise<ReadonlySet<OrganizationRole>> {
  const catalog = await listTenantRoleCatalog({
    organizationId: input.organizationId,
  });

  return new Set(
    catalog
      .filter((entry) => entry.deprecated)
      .map((entry) => entry.role as OrganizationRole),
  );
}

export function findDeprecatedRolesInSelection(input: {
  roles: readonly string[];
  deprecatedRoles: ReadonlySet<OrganizationRole>;
}) {
  return input.roles.filter((role) =>
    input.deprecatedRoles.has(role as OrganizationRole),
  );
}

export async function assertApprovalRuleRolesAllowed(input: {
  organizationId: string;
  approverRoleKeys: readonly string[];
  delegateToRoleKeys: readonly string[];
  escalationRoleKeys: readonly string[];
}) {
  const deprecatedRoles = await listDeprecatedOrganizationRoles({
    organizationId: input.organizationId,
  });

  const blocked = findDeprecatedRolesInSelection({
    roles: [
      ...input.approverRoleKeys,
      ...input.delegateToRoleKeys,
      ...input.escalationRoleKeys,
    ],
    deprecatedRoles,
  });

  if (blocked.length > 0) {
    throw new Error(
      `Deprecated roles cannot be used in approval rules: ${[...new Set(blocked)].join(", ")}`,
    );
  }
}
