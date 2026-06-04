import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { buildLinkedControlListSurface } from "../../overview/surfaces/system-admin.control-list.shared";
import { systemAdminCapabilitiesUiCopy } from "./system-admin.capabilities-ui.copy.shared";
import type { SystemAdminCapabilityRoleMatrixRow } from "./system-admin.capabilities-role-matrix.server";

export const systemAdminCapabilityRoleMatrixSurfaceKey =
  "system-admin.capabilities.role-matrix";

export function buildCapabilityRoleMatrixListSurface(input: {
  rows: readonly SystemAdminCapabilityRoleMatrixRow[];
  roleFilter?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const filteredRows = input.roleFilter
    ? input.rows.filter((row) => row.role === input.roleFilter)
    : input.rows;

  return buildLinkedControlListSurface({
    key: systemAdminCapabilityRoleMatrixSurfaceKey,
    title: systemAdminCapabilitiesUiCopy.roleMatrix.title,
    object: "capability-role-matrix",
    columns: [
      { id: "roleLabel", header: "Role", priority: "primary", pin: "start" },
      { id: "capabilityLabel", header: "Capability" },
      { id: "moduleKey", header: "Module" },
      { id: "requiredPermission", header: "Permission" },
      { id: "access", header: "Access", cellKind: { kind: "badge" } },
      { id: "orgAvailability", header: "Org availability", cellKind: { kind: "badge" } },
    ],
    rows: filteredRows.map((row) => ({
      id: row.id,
      cells: {
        roleLabel: row.roleLabel,
        capabilityLabel: row.capabilityLabel,
        moduleKey: row.moduleKey,
        requiredPermission: row.requiredPermission,
        access: row.access,
        orgAvailability: row.orgAvailability,
      },
    })),
    emptyTitle: systemAdminCapabilitiesUiCopy.roleMatrix.emptyTitle,
    emptyDescription: systemAdminCapabilitiesUiCopy.roleMatrix.emptyDescription,
    searchPlaceholder: systemAdminCapabilitiesUiCopy.roleMatrix.searchPlaceholder,
  });
}
