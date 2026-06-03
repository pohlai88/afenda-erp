import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { filterSystemAdminListRows } from "../../overview/contracts/system-admin.list-filter.shared";
import {
  resolveSystemAdminListSearch,
  resolveSystemAdminListStatusFilter,
} from "../../overview/contracts/system-admin.list-search.shared";
import { listRoleOverridesForOrganization } from "../../users/data/system-admin.identity.repository.server";
import type {
  SystemAdminPermissionCatalogRow,
  SystemAdminPermissionListRow,
  SystemAdminRoleOverrideListRow,
} from "../contracts";
import { buildSystemAdminPermissionCatalogRows } from "./system-admin.permissions.query.server";

function mapPermissionCatalogRow(
  permission: SystemAdminPermissionCatalogRow,
): SystemAdminPermissionListRow {
  return {
    id: permission.id,
    permission: permission.permission,
    module: permission.module,
    group: permission.group,
    label: permission.label,
    description: permission.description,
    capabilityCount: String(permission.capabilityCount),
    roleCount: String(permission.roleCount),
    status: permission.status,
    coverageVerdict: permission.coverageVerdict,
    riskLevel: permission.riskLevel,
  };
}

function mapRoleOverrideListRow(
  override: Awaited<
    ReturnType<typeof listRoleOverridesForOrganization>
  >[number],
): SystemAdminRoleOverrideListRow {
  return {
    role: override.role,
    permissionKey: override.permissionKey,
    enabled: override.enabled,
  };
}

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
  const coverageFilter = resolveSystemAdminListStatusFilter(
    input.searchParams,
    "permissions",
  );

  const roleOverrideRows = await listRoleOverridesForOrganization({
    organizationId: input.organizationId,
    limit: 500,
  });
  const roleOverrides = roleOverrideRows.map(mapRoleOverrideListRow);
  const catalogRows = buildSystemAdminPermissionCatalogRows({
    roleOverrides: roleOverrideRows,
  });

  const filteredRows = filterSystemAdminListRows(
    catalogRows.map(mapPermissionCatalogRow),
    searchValue,
    [
      "permission",
      "module",
      "group",
      "label",
      "description",
      "coverageVerdict",
      "status",
      "riskLevel",
    ],
  ).filter((row) =>
    coverageFilter ? row.coverageVerdict === coverageFilter : true,
  );

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: "system-admin.permission_catalog.view",
    targetType: "organization",
    targetId: input.organizationId,
    metadata: {
      permissionCount: filteredRows.length,
      search: searchValue ?? null,
      coverageFilter: coverageFilter ?? null,
    },
  });

  return {
    searchValue,
    coverageFilter,
    permissions: filteredRows,
    missingPermissionCount: catalogRows.filter((row) => row.status === "missing")
      .length,
    roleOverrides,
  };
}
