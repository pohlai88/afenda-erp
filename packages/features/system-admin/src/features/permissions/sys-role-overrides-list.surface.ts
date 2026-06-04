import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "../overview/sys-list-surface.shared";
import type { SystemAdminRoleOverrideListRow } from "./sys-permissions.contract";
import { systemAdminUsersUiCopy } from "../users/sys-users-ui.copy.shared";

export const systemAdminRoleOverridesSurfaceKey =
  "system-admin.role-overrides.list";

const OVERRIDE_COLUMNS = [
  {
    id: "role",
    header: "Role",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "permissionKey", header: "Permission" },
  {
    id: "enabled",
    header: "Enabled",
    cellKind: { kind: "badge" as const },
  },
];

export function buildRoleOverridesListSurface(input: {
  overrides: readonly SystemAdminRoleOverrideListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = systemAdminUsersUiCopy.identity.overridesList;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: "roleOverrides",
        searchPlaceholder: copy.searchPlaceholder,
        sortColumn: "permissionKey",
        filters: [
          {
            id: "enabled",
            label: "State",
            param: "roleOverridesEnabled",
            options: [
              { label: "Enabled", value: "enabled" },
              { label: "Disabled", value: "disabled" },
            ],
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "role-overrides",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(input.overrides.length),
    surface: {
      header: { title: copy.surfaceHeaderTitle },
      columnsId: "system-admin-role-overrides",
      rowKey: "permissionKey",
      empty: {
        variant: "muted",
        title: copy.emptyTitle,
        description: copy.emptyDescription,
      },
    },
    columns: OVERRIDE_COLUMNS,
    rows: input.overrides.map((override) => ({
      id: `${override.role}:${override.permissionKey}`,
      cells: {
        role: override.role,
        permissionKey: override.permissionKey,
        enabled: override.enabled ? "Yes" : "No",
      },
      rowTone: override.enabled ? ("default" as const) : ("attention" as const),
    })),
  });
}
