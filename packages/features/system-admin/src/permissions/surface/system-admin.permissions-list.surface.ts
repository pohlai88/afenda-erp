import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import {
  buildLinkedControlListSurface,
  catalogStatusBadge,
  linkCell,
  permissionCoverageVerdictBadge,
  riskLevelBadge,
} from "../../overview/surfaces/system-admin.control-list.shared";
import type { SystemAdminPermissionListRow } from "../contracts";
import { systemAdminPermissionsUiCopy } from "./system-admin.permissions-ui.copy.shared";

export const systemAdminPermissionsSurfaceKey =
  "system-admin.permissions.list";

export function buildPermissionsListSurface(input: {
  permissions: readonly SystemAdminPermissionListRow[];
  searchValue?: string;
  coverageFilter?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const catalogCopy = systemAdminPermissionsUiCopy.catalog;

  return buildLinkedControlListSurface({
    key: systemAdminPermissionsSurfaceKey,
    title: catalogCopy.title,
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
    emptyTitle: catalogCopy.emptyTitle,
    emptyDescription: catalogCopy.emptyDescription,
    searchPlaceholder: catalogCopy.searchPlaceholder,
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
