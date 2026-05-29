import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import {
  buildLinkedControlListSurface,
  catalogStatusBadge,
  linkCell,
} from "../../overview/surfaces/system-admin.control-list.shared";
import type { SystemAdminRoleRow } from "../contracts";
import { systemAdminRolesUiCopy } from "../surface/system-admin.roles-ui.copy.shared";

export const systemAdminRolesSurfaceKey = "system-admin.roles.list";

export function buildRolesListSurface(input: {
  roles: readonly SystemAdminRoleRow[];
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const listCopy = systemAdminRolesUiCopy.list;

  return buildLinkedControlListSurface({
    key: systemAdminRolesSurfaceKey,
    title: listCopy.title,
    object: "roles",
    columns: [
      {
        id: "name",
        header: "Role",
        priority: "primary",
        pin: "start",
        cellKind: { kind: "link" },
      },
      { id: "key", header: "Key" },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
      {
        id: "permissions",
        header: "Permissions",
        cellKind: { kind: "link" },
      },
      {
        id: "assignedMembers",
        header: "Assigned members",
        cellKind: { kind: "link" },
      },
      { id: "description", header: "Description", clip: true },
    ],
    rows: input.roles.map((role) => ({
      id: role.key,
      cells: {
        name: role.name,
        key: role.key,
        status: role.status,
        permissions: String(role.permissionCount ?? 0),
        assignedMembers: String(role.assignedMembers),
        description: role.description,
      },
      rowHref: systemAdminRoutePaths.identity,
      linkColumnId: "name",
      cellKinds: {
        name: linkCell(systemAdminRoutePaths.identity),
        permissions: linkCell(systemAdminControlLinks.identity()),
        assignedMembers: linkCell(systemAdminRoutePaths.memberships),
        status: catalogStatusBadge(role.status),
      },
    })),
    emptyTitle: listCopy.emptyTitle,
    emptyDescription: listCopy.emptyDescription,
    searchPlaceholder: listCopy.searchPlaceholder,
    searchValue: input.searchValue,
  });
}
