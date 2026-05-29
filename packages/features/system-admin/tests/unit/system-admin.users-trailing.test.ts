import { describe, expect, it } from "vitest";
import {
  resolveSystemAdminUserRowTrailingAction,
  SYSTEM_ADMIN_USERS_MANAGE_DENIED,
} from "../../src/users/surface/system-admin.users-list-trailing.shared";

describe("system admin users list trailing metadata", () => {
  it("hides trailing actions for removed memberships", () => {
    const action = resolveSystemAdminUserRowTrailingAction({
      status: "removed",
      canMutate: true,
      hasMembership: true,
    });

    expect(action?.state).toBe("hidden");
  });

  it("marks trailing actions disabled without manage capability", () => {
    const action = resolveSystemAdminUserRowTrailingAction({
      status: "active",
      canMutate: false,
      hasMembership: true,
    });

    expect(action?.state).toBe("disabled");
    expect(action?.disabledReason).toBe(SYSTEM_ADMIN_USERS_MANAGE_DENIED);
  });
});
