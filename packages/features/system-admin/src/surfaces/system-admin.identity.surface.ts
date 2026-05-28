import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import type { TenantMemberSummary } from "@afenda/db";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "../surfaces/system-admin.list-surface.shared";

export const systemAdminMembersSurfaceKey = "system-admin.members.list";
export const systemAdminInvitationsSurfaceKey = "system-admin.invitations.list";
export const systemAdminRoleOverridesSurfaceKey =
  "system-admin.role-overrides.list";

const MEMBER_COLUMNS = [
  {
    id: "name",
    header: "Name",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "email", header: "Email" },
  { id: "role", header: "Role", cellKind: { kind: "badge" as const } },
];

const INVITATION_COLUMNS = [
  {
    id: "email",
    header: "Email",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "role", header: "Role", cellKind: { kind: "badge" as const } },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "expiresAt", header: "Expires" },
];

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

const WRITE_REQUIRED_REASON = "Requires system-admin.identity.write.";

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
      toolbar: buildSystemAdminListToolbar({
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
    pagination: buildSystemAdminStaticPagination(input.members.length),
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
      toolbar: buildSystemAdminListToolbar({
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
    pagination: buildSystemAdminStaticPagination(input.invitations.length),
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
        expiresAt: formatErpDateTime(invitation.expiresAt),
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
      toolbar: buildSystemAdminListToolbar({
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
    pagination: buildSystemAdminStaticPagination(input.overrides.length),
    surface: {
      header: { title: "Role permission overrides" },
      columnsId: "system-admin-role-overrides",
      rowKey: "permissionKey",
      empty: {
        variant: "muted",
        title: "No tenant-specific overrides configured.",
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
