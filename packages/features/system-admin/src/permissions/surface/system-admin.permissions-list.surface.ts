import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import {
  buildLinkedControlListSurface,
  catalogStatusBadge,
  linkCell,
  permissionCoverageVerdictBadge,
  riskLevelBadge,
} from "../../overview/surfaces/system-admin.control-list.shared";

export const systemAdminPermissionsSurfaceKey =
  "system-admin.permissions.list";

export function buildPermissionsListSurface(input: {
  permissions: ReadonlyArray<{
    id: string;
    permission: string;
    module: string;
    group: string;
    label: string;
    description: string;
    capabilityCount: string;
    roleCount: string;
    status: string;
    coverageVerdict: string;
    riskLevel: string;
  }>;
  searchValue?: string;
  coverageFilter?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminPermissionsSurfaceKey,
    title: "Permission catalog",
    object: "permissions",
    columns: [
      {
        id: "permission",
        header: "Permission",
        priority: "primary",
        pin: "start",
        cellKind: { kind: "link" },
      },
      { id: "module", header: "Module", cellKind: { kind: "link" } },
      { id: "group", header: "Group" },
      { id: "capabilityCount", header: "Capabilities", cellKind: { kind: "link" } },
      { id: "roleCount", header: "Roles", cellKind: { kind: "link" } },
      { id: "coverageVerdict", header: "Coverage", cellKind: { kind: "badge" } },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
      { id: "riskLevel", header: "Risk", cellKind: { kind: "badge" } },
      { id: "label", header: "Label" },
      { id: "description", header: "Description" },
    ],
    rows: input.permissions.map((permission) => ({
      id: permission.id,
      cells: {
        permission: permission.permission,
        module: permission.module,
        group: permission.group,
        capabilityCount: permission.capabilityCount,
        roleCount: permission.roleCount,
        coverageVerdict: permission.coverageVerdict,
        status: permission.status,
        riskLevel: permission.riskLevel,
        label: permission.label,
        description: permission.description,
      },
      rowHref: systemAdminControlLinks.capabilities(permission.permission),
      linkColumnId: "permission",
      cellKinds: {
        permission: linkCell(
          permission.status === "missing"
            ? systemAdminControlLinks.capabilities(permission.permission)
            : systemAdminControlLinks.permissions(permission.permission),
        ),
        module: linkCell(systemAdminControlLinks.modules(permission.module)),
        capabilityCount: linkCell(
          systemAdminControlLinks.capabilities(permission.permission),
        ),
        roleCount: linkCell(systemAdminControlLinks.roles()),
        coverageVerdict: permissionCoverageVerdictBadge(
          permission.coverageVerdict,
        ),
        status: catalogStatusBadge(permission.status),
        riskLevel: riskLevelBadge(permission.riskLevel),
      },
    })),
    emptyTitle: "No permissions match the current filters.",
    searchValue: input.searchValue,
    filters: [
      {
        id: "coverage",
        label: "Coverage",
        param: "permissionsStatus",
        options: [
          { label: "Covered", value: "covered" },
          { label: "Orphan", value: "orphan" },
          { label: "Missing capability", value: "missing_capability" },
          { label: "Unassigned", value: "unassigned" },
          { label: "Overprivileged", value: "overprivileged" },
          { label: "Deprecated", value: "deprecated" },
        ],
      },
    ],
  });
}
