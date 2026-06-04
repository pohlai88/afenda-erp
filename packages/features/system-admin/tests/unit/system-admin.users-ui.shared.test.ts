import { describe, expect, it } from "vitest";
import { formatSystemAdminListPreview } from "../../src/features/overview/sys-list-preview.shared";
import { systemAdminUserStatusBadgeVariant } from "../../src/features/users/sys-users-status-badge.shared";

describe("system admin list preview formatter", () => {
  it("returns empty label when no values", () => {
    expect(formatSystemAdminListPreview([])).toBe("None");
    expect(formatSystemAdminListPreview([], { emptyLabel: "Empty" })).toBe("Empty");
  });

  it("truncates long lists with remainder count", () => {
    const values = Array.from({ length: 15 }, (_, index) => `cap-${index}`);
    expect(formatSystemAdminListPreview(values, { limit: 12 })).toBe(
      "cap-0, cap-1, cap-2, cap-3, cap-4, cap-5, cap-6, cap-7, cap-8, cap-9, cap-10, cap-11 (+3 more)",
    );
  });
});

describe("system admin user status badge variants", () => {
  it("maps lifecycle statuses to semantic badge variants", () => {
    expect(systemAdminUserStatusBadgeVariant.active).toBe("success");
    expect(systemAdminUserStatusBadgeVariant.invited).toBe("warning");
    expect(systemAdminUserStatusBadgeVariant.suspended).toBe("critical");
    expect(systemAdminUserStatusBadgeVariant.removed).toBe("outline");
  });
});
