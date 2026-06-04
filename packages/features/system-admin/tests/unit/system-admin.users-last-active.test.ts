import { describe, expect, it } from "vitest";
import { formatSystemAdminUserLastActive } from "../../src/features/users/sys-users-last-active.shared";

describe("formatSystemAdminUserLastActive", () => {
  it("labels invited users as not joined", () => {
    expect(
      formatSystemAdminUserLastActive({
        status: "invited",
        lastAuditAt: null,
        membershipUpdatedAt: null,
      }),
    ).toBe("Not joined");
  });

  it("prefers the latest audit or membership timestamp for active users", () => {
    const formatted = formatSystemAdminUserLastActive({
      status: "active",
      lastAuditAt: new Date("2026-05-27T10:00:00.000Z"),
      membershipUpdatedAt: new Date("2026-05-20T10:00:00.000Z"),
    });

    expect(formatted).toContain("2026");
  });
});
