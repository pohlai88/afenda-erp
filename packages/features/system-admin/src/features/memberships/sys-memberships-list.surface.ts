import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
  type ListSurfaceRow,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { organizationRoles } from "@afenda/auth";
import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import { linkCell } from "../../overview/surfaces/system-admin.control-list.shared";
import { systemAdminSeedRoles } from "../../roles/contracts";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "../../overview/surfaces/system-admin.list-surface.shared";
import {
  systemAdminMembershipStatuses,
  type SystemAdminMembershipRow,
  type SystemAdminMembershipStatus,
} from "../contracts";
import { resolveSystemAdminMembershipRowTrailingAction } from "./system-admin.memberships-list-trailing.shared";
import { systemAdminMembershipsUiCopy } from "./system-admin.memberships-ui.copy.shared";

const MEMBERSHIP_STATUS_BADGE: Record<
  SystemAdminMembershipStatus,
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  active: { kind: "badge", tone: "positive" },
  suspended: { kind: "badge", tone: "critical" },
  removed: { kind: "badge", tone: "critical" },
};

export const systemAdminMembersSurfaceKey = "system-admin.members.list";

const roleLabelByKey = new Map(
  systemAdminSeedRoles.map((role) => [role.key, role.name]),
);

const MEMBERSHIP_ROLE_FILTER_OPTIONS = organizationRoles.map((role) => ({
  label: roleLabelByKey.get(role) ?? role,
  value: role,
}));

const MEMBERSHIP_COLUMNS = [
  {
    id: "member",
    header: "Member",
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
    id: "primaryRole",
    header: "Primary role",
    cellKind: { kind: "badge" as const },
    minWidth: 120,
  },
  { id: "roleCount", header: "Role count", minWidth: 100 },
  { id: "joinedAt", header: "Joined at", minWidth: 180 },
  { id: "updatedAt", header: "Updated at", minWidth: 180 },
];

export function buildMembersListSurface(input: {
  memberships: readonly SystemAdminMembershipRow[];
  canMutate?: boolean;
  canManageRoles?: boolean;
  searchValue?: string;
  totalCount?: number;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canMutate = input.canMutate ?? false;
  const canManageRoles = input.canManageRoles ?? false;
  const totalCount = input.totalCount ?? input.memberships.length;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: "members",
        searchPlaceholder: systemAdminMembershipsUiCopy.listSurface.searchPlaceholder,
        sortColumn: "member",
        searchValue: input.searchValue,
        filters: [
          {
            id: "status",
            label: "Status",
            param: "membersStatus",
            options: systemAdminMembershipStatuses.map((status) => ({
              label: status.charAt(0).toUpperCase() + status.slice(1),
              value: status,
            })),
          },
          {
            id: "role",
            label: "Role",
            param: "membersRole",
            options: MEMBERSHIP_ROLE_FILTER_OPTIONS,
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "members",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(
      totalCount,
      input.memberships.length,
    ),
    surface: {
      header: {
        title: systemAdminMembershipsUiCopy.listSurface.title,
        description: systemAdminMembershipsUiCopy.listSurface.description,
      },
      columnsId: "system-admin-memberships",
      rowKey: "membershipId",
      empty: {
        variant: "muted",
        title: systemAdminMembershipsUiCopy.listSurface.emptyTitle,
        description: systemAdminMembershipsUiCopy.listSurface.emptyDescription,
      },
    },
    columns: MEMBERSHIP_COLUMNS,
    rows: input.memberships.map((membership) => ({
      id: membership.membershipId,
      cells: {
        member: membership.name,
        email: membership.email,
        status: membership.status,
        primaryRole: membership.role,
        roleCount: String(membership.roleCount),
        joinedAt: formatErpDateTime(membership.createdAt),
        updatedAt: formatErpDateTime(membership.updatedAt),
        membershipId: membership.membershipId,
        membershipStatus: membership.status,
        role: membership.role,
        rolesHref: systemAdminControlLinks.roles(),
        canManageRoles: canManageRoles ? "true" : "false",
        canMutateMemberships: canMutate ? "true" : "false",
      },
      rowHref:
        membership.status !== "removed"
          ? systemAdminControlLinks.roles()
          : undefined,
      cellKinds: {
        status: MEMBERSHIP_STATUS_BADGE[membership.status],
        primaryRole: linkCell(systemAdminControlLinks.roles()),
      },
      trailingAction: resolveSystemAdminMembershipRowTrailingAction({
        status: membership.status,
        canMutate,
        canManageRoles,
      }),
    })),
  });
}
