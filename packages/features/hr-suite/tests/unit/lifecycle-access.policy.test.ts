import { describe, expect, it, vi } from "vitest";

vi.mock("@afenda/kernel/execution", () => ({
  requireExecutionContext: vi.fn(),
  requireExecutionPermission: vi.fn(),
  hasExecutionPermission: vi.fn(() => true),
}));

import {
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

import { requireHrLifecycleRead } from "../../src/employee-management/employee-lifecycle-management/policies/hr.workforce.lifecycle-access.policy.server";

describe("requireHrLifecycleRead", () => {
  it("requires hr.lifecycle.read on the execution context", async () => {
    const context = {
      userId: "user-1",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "admin" as const,
      capabilities: ["hr.lifecycle.read" as const],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);

    const guard = await requireHrLifecycleRead();

    expect(requireExecutionPermission).toHaveBeenCalledWith(
      context,
      "hr.lifecycle.read",
    );
    expect(guard.organization.id).toBe("org-1");
    expect(guard.hasCapability("hr.lifecycle.read")).toBe(true);
  });
});
