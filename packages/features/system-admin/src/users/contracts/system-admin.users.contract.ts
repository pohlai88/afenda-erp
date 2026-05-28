import type { OrganizationRole } from "@afenda/auth";

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
  createdAt: Date;
};

export type SystemAdminInviteUserResult = {
  invitationId: string;
  token: string;
};
