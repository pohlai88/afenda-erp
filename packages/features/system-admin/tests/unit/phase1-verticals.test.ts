import { describe, expect, it, vi } from "vitest";
import {
  systemAdminInviteUserInputSchema,
  systemAdminUserStatusInputSchema,
} from "../../src/users/schemas";
import {
  systemAdminAssignRoleInputSchema,
} from "../../src/roles/schemas";
import {
  systemAdminSeedRoles,
} from "../../src/roles/contracts";

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
      "staff",
      "viewer",
    ]);
    expect(systemAdminSeedRoles.every((role) => role.status === "active")).toBe(
      true,
    );
  });
});

describe("system admin phase 1 duplicate invite guard", () => {
  it("is covered by the users data contract", async () => {
    const db = await import("@afenda/db");
    const spyMembers = vi
      .spyOn(db, "hasTenantMemberWithEmail")
      .mockResolvedValueOnce(true);
    const spyInvitations = vi
      .spyOn(db, "hasOrganizationInvitationWithEmail")
      .mockResolvedValueOnce(false);
    const { assertSystemAdminUserCanBeInvited } = await import(
      "../../src/users/data"
    );

    await expect(
      assertSystemAdminUserCanBeInvited({
        organizationId: "org_1",
        email: "ADMIN@example.com",
      }),
    ).rejects.toThrow("already invited or active");

    spyMembers.mockRestore();
    spyInvitations.mockRestore();
  });
});
