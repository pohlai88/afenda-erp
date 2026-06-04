import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { systemAdminControlLinks } from "../overview/sys-control-links.contract";
import { systemAdminRoutePaths } from "../overview/sys-route-paths.contract";
import { linkCell } from "../overview/sys-control-list.shared";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "../overview/sys-list-surface.shared";
import type { ListSurfaceRow } from "@afenda/governed-surface";
import type { SystemAdminUserRow, SystemAdminUserStatus } from "./sys-users.contract";
import {
  SYSTEM_ADMIN_USERS_BULK_SUSPEND_ACTION_ID,
  systemAdminUsersBulkSuspendConfirm,
} from "./sys-users-actions.contract";
import { systemAdminUsersUiCopy } from "./sys-users-ui.copy.shared";
import { resolveSystemAdminUserRowTrailingAction } from "./sys-users-list-trailing.shared";

const USER_STATUS_BADGE: Record<
  SystemAdminUserStatus,
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  active: { kind: "badge", tone: "positive" },
  invited: { kind: "badge", tone: "attention" },
  suspended: { kind: "badge", tone: "critical" },
  removed: { kind: "badge", tone: "critical" },
};

export const systemAdminUsersSurfaceKey = "system-admin.users.list";

const USER_COLUMNS = [
  {
    id: "user",
    header: "User",
    priority: "primary" as const,
    pin: "start" as const,
    minWidth: 160,
  },
  { id: "email", header: "Email", minWidth: 200, clip: true },
  {
    id: "status",
    header: "Status",
    cellKind: { kind: "badge" as const },
    minWidth: 100,
  },
  {
    id: "membership",
    header: "Membership",
    cellKind: { kind: "badge" as const },
    minWidth: 120,
  },
  {
    id: "roles",
    header: "Roles",
    minWidth: 120,
    clip: true,
    cellKind: { kind: "link" as const },
  },
  {
    id: "lastActive",
    header: "Last active",
    minWidth: 180,
  },
  { id: "invitedAt", header: "Invited at", minWidth: 180 },
  { id: "joinedAt", header: "Joined at", minWidth: 180 },
];

export function buildUsersListSurface(input: {
  users: readonly SystemAdminUserRow[];
  canMutate?: boolean;
  searchValue?: string;
  totalCount?: number;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canMutate = input.canMutate ?? false;
  const totalCount = input.totalCount ?? input.users.length;
  const listCopy = systemAdminUsersUiCopy.listSurface;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        ...buildSystemAdminListToolbar({
          scope: "users",
          searchPlaceholder: listCopy.searchPlaceholder,
          sortColumn: "user",
          searchValue: input.searchValue,
          filters: [
            {
              id: "status",
              label: "Status",
              param: "usersStatus",
              options: [
                { label: "Invited", value: "invited" },
                { label: "Active", value: "active" },
                { label: "Suspended", value: "suspended" },
                { label: "Removed", value: "removed" },
              ],
            },
          ],
        }),
        bulkActions: canMutate
          ? [
              {
                actionId: SYSTEM_ADMIN_USERS_BULK_SUSPEND_ACTION_ID,
                kind: "server-action",
                label: "Suspend selected",
                confirm: systemAdminUsersBulkSuspendConfirm,
              },
            ]
          : undefined,
      },
      selection: canMutate
        ? {
            mode: "multiple",
            label: "Select users",
            bulkScopeLabel: "users selected",
          }
        : undefined,
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "users",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(totalCount, input.users.length),
    surface: {
      header: {
        title: listCopy.title,
        description: listCopy.description,
      },
      columnsId: "system-admin-users",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: listCopy.emptyTitle,
        description: listCopy.emptyDescription,
      },
    },
    columns: USER_COLUMNS,
    rows: input.users.map((user) => ({
      id: user.id,
      cells: {
        user: user.name,
        email: user.email,
        status: user.status,
        membership: user.membership,
        roles: user.roles.join(", "),
        lastActive: user.lastActive,
        invitedAt: user.invitedAt ? formatErpDateTime(user.invitedAt) : "—",
        joinedAt: user.joinedAt ? formatErpDateTime(user.joinedAt) : "—",
        membershipId: user.membershipId ?? "",
        invitationId: user.invitationId ?? "",
        userStatus: user.status,
        rolesHref: systemAdminControlLinks.roles(),
      },
      rowHref:
        user.membershipId && user.status !== "invited"
          ? systemAdminRoutePaths.memberships
          : undefined,
      cellKinds: {
        status: USER_STATUS_BADGE[user.status],
        membership: USER_STATUS_BADGE[
          user.status === "invited" ? "invited" : user.status
        ],
        roles: linkCell(systemAdminControlLinks.roles()),
      },
      trailingAction: resolveSystemAdminUserRowTrailingAction({
        status: user.status,
        canMutate,
        hasMembership: Boolean(user.membershipId),
      }),
      selectionDisabledReason:
        user.status === "active" && user.membershipId
          ? undefined
          : "Only active organization memberships can be bulk suspended.",
    })),
  });
}
