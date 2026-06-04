import type { OrganizationRole } from "@afenda/kernel";

export const systemAdminMembershipStatuses = [
  "active",
  "suspended",
  "removed",
] as const;

export type SystemAdminMembershipStatus =
  (typeof systemAdminMembershipStatuses)[number];

export type SystemAdminMembershipRow = {
  membershipId: string;
  authUserId: string;
  name: string;
  email: string;
  status: SystemAdminMembershipStatus;
  role: OrganizationRole;
  roleCount: number;
  createdAt: Date;
  updatedAt: Date;
};
