import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { listRoleOverridesForOrganization } from "../../data/repositories/system-admin.identity.repository.server";
import { resolveSystemAdminListSearch } from "../../contracts/system-admin.list-search.shared";
import { listSystemAdminPermissionCatalog } from "./system-admin.permissions.query.server";

export async function buildSystemAdminPermissionsPageModel(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchValue = resolveSystemAdminListSearch(
    input.searchParams,
    "permissions",
  );
  const roleOverrides = await listRoleOverridesForOrganization({
    organizationId: input.organizationId,
    limit: 500,
  });
  const permissions = await listSystemAdminPermissionCatalog({
    organizationId: input.organizationId,
    roleOverrides,
  });

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: "system-admin.permission_catalog.view",
    targetType: "organization",
    targetId: input.organizationId,
    metadata: {
      permissionCount: permissions.length,
      search: searchValue ?? null,
    },
  });

  return {
    searchValue,
    permissions: permissions.map((permission) => ({
      id: permission.id,
      permission: permission.permission,
      module: permission.module,
      label: permission.label,
      capabilityCount: String(permission.capabilityCount),
      roleCount: String(permission.roleCount),
      status: permission.status,
      riskLevel: permission.riskLevel,
    })),
  };
}
