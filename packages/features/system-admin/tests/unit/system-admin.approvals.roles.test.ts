import { describe, expect, it } from "vitest";
import {
  findDeprecatedRolesInSelection,
} from "../../src/features/approvals/sys-approval-rules.roles.server";

describe("approval role deprecation guard", () => {
  it("flags deprecated organization roles in approval selections", () => {
    const deprecated = new Set(["finance-manager" as const]);
    expect(
      findDeprecatedRolesInSelection({
        roles: ["admin", "finance-manager"],
        deprecatedRoles: deprecated,
      }),
    ).toEqual(["finance-manager"]);
  });
});
