import { describe, expect, it } from "vitest";
import { systemAdminInviteUserInputSchema, systemAdminUserStatusInputSchema } from "../../src/features/users/sys-users.schema";
import { systemAdminAssignRoleInputSchema } from "../../src/features/roles/sys-roles.schema";
import { systemAdminSeedRoles } from "../../src/features/roles/sys-roles.contract";

describe("system admin phase 1 vertical contracts", () => {
  it("validates and normalizes invite user input", () => {
    const parsed = systemAdminInviteUserInputSchema.parse({
      email: "Admin@Example.COM",
      role: "admin",
    });

    expect(parsed).toEqual({
      email: "admin@example.com",
      role: "admin",
    });
    expect(
      systemAdminInviteUserInputSchema.safeParse({ email: "invalid" }).success,
    ).toBe(false);
  });

  it("bounds user and role mutation inputs", () => {
    expect(
      systemAdminUserStatusInputSchema.safeParse({
        membershipId: "member_1",
        status: "suspended",
      }).success,
    ).toBe(true);
    expect(
      systemAdminUserStatusInputSchema.safeParse({
        membershipId: "member_1",
        status: "removed",
      }).success,
    ).toBe(true);
    expect(
      systemAdminAssignRoleInputSchema.safeParse({
        membershipId: "member_1",
        role: "owner",
      }).success,
    ).toBe(true);
    expect(
      systemAdminAssignRoleInputSchema.safeParse({
        membershipId: "",
        role: "owner",
      }).success,
    ).toBe(false);
  });

  it("keeps Phase 1 role catalog active and seeded", () => {
    expect(systemAdminSeedRoles.map((role) => role.key)).toEqual([
      "owner",
      "admin",
      "finance-manager",
      "operations-manager",
      "staff",
      "viewer",
    ]);
    expect(systemAdminSeedRoles.every((role) => role.status === "active")).toBe(
      true,
    );
  });
});

