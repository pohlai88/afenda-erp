import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { TenantMemberSummary } from "@afenda/db";
import { formatSystemAdminDateTime } from "../lib/format";

export const systemAdminMembersSurfaceKey = "system-admin.members.list";
export const systemAdminInvitationsSurfaceKey = "system-admin.invitations.list";
export const systemAdminRoleOverridesSurfaceKey = "system-admin.role-overrides.list";

const MEMBER_COLUMNS = [
  { id: "name", header: "Name", priority: "primary" as const, pin: "start" as const },
  { id: "email", header: "Email" },
  { id: "role", header: "Role", cellKind: { kind: "badge" as const } },
];

const INVITATION_COLUMNS = [
  { id: "email", header: "Email", priority: "primary" as const, pin: "start" as const },
  { id: "role", header: "Role", cellKind: { kind: "badge" as const } },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "expiresAt", header: "Expires" },
];

const OVERRIDE_COLUMNS = [
  { id: "role", header: "Role", priority: "primary" as const, pin: "start" as const },
  { id: "permissionKey", header: "Permission" },
  {
    id: "enabled",
    header: "Enabled",
    cellKind: { kind: "badge" as const },
  },
];

function pagination(total: number) {
  return {
    pageSize: Math.max(1, total),
    totalCount: total,
    hasNextPage: false,

  };
}

const WRITE_REQUIRED_REASON = "Requires system-admin.identity.write.";

function toolbar(input: {
  scope: string;
  searchPlaceholder: string;
  sortColumn: string;
  filters?: Array<{
    id: string;
    label: string;
    param: string;
    options: Array<{ label: string; value: string }>;
  }>;
}) {
  return {
    search: {
      param: `${input.scope}Q`,
      label: "Search",
      placeholder: input.searchPlaceholder,
    },
    filters: input.filters,
    sort: {
      label: "Sort",
      param: `${input.scope}Sort`,
      options: [
        {
          label: "Ascending",
          value: "asc",
          columnId: input.sortColumn,
          direction: "asc" as const,
        },
        {
          label: "Descending",
          value: "desc",
          columnId: input.sortColumn,
          direction: "desc" as const,
        },
      ],
    },
    densityToggle: true,
    columnPicker: true,
    resetParams: [
      `${input.scope}Q`,
      `${input.scope}Sort`,
      ...(input.filters ?? []).map((filter) => filter.param),
    ],
  };
}

export function buildMembersListSurface(input: {
  members: readonly TenantMemberSummary[];
  canMutate?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canMutate = input.canMutate ?? false;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: toolbar({
        scope: "members",
        searchPlaceholder: "Search members",
        sortColumn: "name",
        filters: [
          {
            id: "role",
            label: "Role",
            param: "membersRole",
            options: [
              { label: "Owner", value: "owner" },
              { label: "Admin", value: "admin" },
              { label: "Manager", value: "manager" },
              { label: "Staff", value: "staff" },
              { label: "Auditor", value: "auditor" },
            ],
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "members",
      function: "read",
    },
    pagination: pagination(input.members.length),
    surface: {
      header: { title: "Organization members" },
      columnsId: "system-admin-members",
      rowKey: "membershipId",
      empty: { variant: "muted", title: "No members found for this tenant." },
    },
    columns: MEMBER_COLUMNS,
    rows: input.members.map((member) => ({
      id: member.membershipId,
      cells: {
        authUserId: member.authUserId,
        name: member.name,
        email: member.email,
        role: member.role,
      },
      trailingAction: resolveListSurfaceRowTrailingAction({
        visible: true,
        allowed: canMutate,
        disabledReason: WRITE_REQUIRED_REASON,
        descriptor: {
          id: "system-admin.member.role.change",
          label: "Change role",
          intent: "default",
        },
      }),
    })),
  });
}

export function buildInvitationsListSurface(input: {
  invitations: ReadonlyArray<{
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: Date;
  }>;
  canMutate?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canMutate = input.canMutate ?? false;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: toolbar({
        scope: "invitations",
        searchPlaceholder: "Search invitations",
        sortColumn: "email",
        filters: [
          {
            id: "status",
            label: "Status",
            param: "invitationsStatus",
            options: [
              { label: "Pending", value: "pending" },
              { label: "Accepted", value: "accepted" },
              { label: "Revoked", value: "revoked" },
              { label: "Expired", value: "expired" },
            ],
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "invitations",
      function: "read",
    },
    pagination: pagination(input.invitations.length),
    surface: {
      header: { title: "Pending invitations" },
      columnsId: "system-admin-invitations",
      rowKey: "id",
      empty: { variant: "muted", title: "No invitations on file." },
    },
    columns: INVITATION_COLUMNS,
    rows: input.invitations.map((invitation) => ({
      id: invitation.id,
      cells: {
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: formatSystemAdminDateTime(invitation.expiresAt),
      },
      trailingAction:
        invitation.status === "pending"
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: canMutate,
              disabledReason: WRITE_REQUIRED_REASON,
              descriptor: {
                id: "system-admin.invitation.revoke",
                label: "Revoke",
                intent: "destructive",
                confirm: {
                  title: "Revoke invitation",
                  description:
                    "This invitation token will stop working immediately.",
                  confirmLabel: "Revoke",
                },
              },
            })
          : undefined,
    })),
  });
}

export function buildRoleOverridesListSurface(input: {
  overrides: ReadonlyArray<{
    role: string;
    permissionKey: string;
    enabled: boolean;
  }>;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: toolbar({
        scope: "roleOverrides",
        searchPlaceholder: "Search role overrides",
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
    pagination: pagination(input.overrides.length),
    surface: {
      header: { title: "Role permission overrides" },
      columnsId: "system-admin-role-overrides",
      rowKey: "permissionKey",
      empty: { variant: "muted", title: "No tenant-specific overrides configured." },
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
