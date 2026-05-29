import { describe, expect, it } from "vitest";
import {
  resolveSystemAdminMembershipRowTrailingAction,
  SYSTEM_ADMIN_MEMBERSHIPS_MANAGE_DENIED,
  SYSTEM_ADMIN_MEMBERSHIPS_ROLES_MANAGE_DENIED,
} from "../../src/memberships/surface/system-admin.memberships-list-trailing.shared";

describe("system admin memberships list trailing metadata", () => {
  it("hides trailing actions when no membership or role capabilities apply", () => {
    const action = resolveSystemAdminMembershipRowTrailingAction({
      status: "active",
      canMutate: false,
      canManageRoles: false,
    });

    expect(action?.state).toBe("hidden");
  });

  it("keeps trailing actions ready for roles-only administrators", () => {
    const action = resolveSystemAdminMembershipRowTrailingAction({
      status: "active",
      canMutate: false,
      canManageRoles: true,
    });

    expect(action?.state).toBe("ready");
  });

  it("hides trailing actions for removed memberships", () => {
    const action = resolveSystemAdminMembershipRowTrailingAction({
      status: "removed",
      canMutate: true,
      canManageRoles: true,
    });

    expect(action?.state).toBe("hidden");
  });

  it("surfaces capability denial copy constants", () => {
    expect(SYSTEM_ADMIN_MEMBERSHIPS_MANAGE_DENIED).toContain(
      "system-admin.memberships.manage",
    );
    expect(SYSTEM_ADMIN_MEMBERSHIPS_ROLES_MANAGE_DENIED).toContain(
      "system-admin.roles.manage",
    );
  });
});
