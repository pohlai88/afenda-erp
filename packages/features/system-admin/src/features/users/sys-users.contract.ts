import type { AppCapability, OrganizationRole } from "@afenda/kernel";

export type SystemAdminUserStatus = "invited" | "active" | "suspended" | "removed";

export type SystemAdminUserRow = {
  id: string;
  membershipId: string | null;
  invitationId: string | null;
  authUserId: string | null;
  name: string;
  email: string;
  status: SystemAdminUserStatus;
  membership: string;
  roles: readonly OrganizationRole[];
  lastActive: string;
  invitedAt: Date | null;
  joinedAt: Date | null;
  createdAt: Date;
};

export type SystemAdminInviteUserResult = {
  invitationId: string;
  token: string;
};

export type SystemAdminResendInvitationResult = {
  invitationId: string;
  token: string;
};

export type SystemAdminUserAccessInspection = {
  membershipId: string;
  userLabel: string;
  email: string;
  membershipStatus: SystemAdminUserStatus;
  assignedRoles: readonly OrganizationRole[];
  effectivePermissions: readonly AppCapability[];
  enabledModules: readonly string[];
  accessibleCapabilities: readonly string[];
  blockedCapabilities: readonly string[];
  accessImpact: string;
};
