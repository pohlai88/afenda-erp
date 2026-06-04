import { describe, expect, it, vi } from "vitest";

vi.mock("@afenda/kernel/execution", () => ({
  hasExecutionPermission: (
    context: { capabilities: readonly string[] },
    capability: string,
  ) => context.capabilities.includes(capability),
  requireExecutionContext: vi.fn(),
  requireExecutionPermission: vi.fn(),
}));

import type { ExecutionContext } from "@afenda/kernel/execution";
import { hasSystemAdminAnyCapability } from "../../src/features/overview/sys-capability.policy.server";

function buildContext(
  capabilities: ExecutionContext["capabilities"],
): ExecutionContext {
  return {
    userId: "user_1",
    actorType: "user",
    organizationId: "org_1",
    organizationSlug: "acme",
    locale: "en",
    role: "staff",
    membershipId: "member_1",
    sessionSource: "dev",
    capabilities,
  };
}

describe("system admin approvals capability guards", () => {
  it("grants read path when operator holds approvals.review only", () => {
    const context = buildContext(["system-admin.approvals.review"]);

    expect(
      hasSystemAdminAnyCapability(context, [
        "system-admin.approvals.read",
        "system-admin.approvals.review",
        "system-admin.settings.read",
      ]),
    ).toBe(true);
  });

  it("does not grant manage path when operator holds approvals.review only", () => {
    const context = buildContext(["system-admin.approvals.review"]);

    expect(
      hasSystemAdminAnyCapability(context, [
        "system-admin.approvals.manage",
        "system-admin.settings.write",
      ]),
    ).toBe(false);
  });

  it("grants strict review mutation when operator holds approvals.review", () => {
    const context = buildContext(["system-admin.approvals.review"]);

    expect(
      hasSystemAdminAnyCapability(context, ["system-admin.approvals.review"]),
    ).toBe(true);
  });

  it("does not grant strict review mutation when operator holds manage only", () => {
    const context = buildContext(["system-admin.approvals.manage"]);

    expect(
      hasSystemAdminAnyCapability(context, ["system-admin.approvals.review"]),
    ).toBe(false);
  });
});
