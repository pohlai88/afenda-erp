import type { OrganizationRole } from "@afenda/auth";
import { organizationRoles } from "@afenda/auth";

export function parseSystemAdminCapabilityMatrixRole(
  matrixRoleRaw: string | string[] | undefined,
): OrganizationRole | undefined {
  const value = Array.isArray(matrixRoleRaw) ? matrixRoleRaw[0] : matrixRoleRaw;

  if (value && (organizationRoles as readonly string[]).includes(value)) {
    return value as OrganizationRole;
  }

  return undefined;
}
