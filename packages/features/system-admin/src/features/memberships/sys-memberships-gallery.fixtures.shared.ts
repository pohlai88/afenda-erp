import type { SystemAdminMembershipRow } from "./sys-memberships.contract";

export const systemAdminMembershipsGalleryRows: readonly SystemAdminMembershipRow[] =
  [
    {
      membershipId: "member-gallery-1",
      authUserId: "user-gallery-1",
      name: "Alex Admin",
      email: "alex@example.com",
      status: "active",
      role: "admin",
      roleCount: 1,
      createdAt: new Date("2026-01-15T00:00:00.000Z"),
      updatedAt: new Date("2026-05-27T00:00:00.000Z"),
    },
    {
      membershipId: "member-gallery-2",
      authUserId: "user-gallery-2",
      name: "Sam Staff",
      email: "sam@example.com",
      status: "suspended",
      role: "staff",
      roleCount: 1,
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
      updatedAt: new Date("2026-05-12T00:00:00.000Z"),
    },
    {
      membershipId: "member-gallery-3",
      authUserId: "user-gallery-3",
      name: "Removed Member",
      email: "removed@example.com",
      status: "removed",
      role: "viewer",
      roleCount: 1,
      createdAt: new Date("2025-12-01T00:00:00.000Z"),
      updatedAt: new Date("2026-04-01T00:00:00.000Z"),
    },
  ] as const;
