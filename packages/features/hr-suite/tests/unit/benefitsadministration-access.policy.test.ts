import { describe, expect, it, vi } from "vitest";

vi.mock("@afenda/kernel/execution", () => ({
  requireExecutionContext: vi.fn(),
  requireExecutionPermission: vi.fn(),
  hasExecutionPermission: vi.fn(),
}));

import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

import { HR_BENEFITS_SENSITIVE_READ_CAPABILITY } from "../../src/payroll-compensation/benefits-administration/hr.payroll.benefits-sensitive-access.shared";
import { requireHrBenefitsRead } from "../../src/payroll-compensation/benefits-administration/hr.payroll.benefits-access.policy.server";

describe("requireHrBenefitsRead (HRM-BEN-027)", () => {
  it("requires hr.benefits.read and denies sensitive detail without hr.benefits.sensitive.read", async () => {
    const context = {
      userId: "user-1",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "member" as const,
      capabilities: ["hr.benefits.read" as const],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) => capability === "hr.benefits.read",
    );

    const guard = await requireHrBenefitsRead();

    expect(requireExecutionPermission).toHaveBeenCalledWith(
      context,
      "hr.benefits.read",
    );
    expect(hasExecutionPermission).toHaveBeenCalledWith(
      context,
      HR_BENEFITS_SENSITIVE_READ_CAPABILITY,
    );
    expect(guard.canViewSensitive).toBe(false);
  });

  it("allows sensitive columns when hr.benefits.sensitive.read is granted", async () => {
    const context = {
      userId: "user-2",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "admin" as const,
      capabilities: [
        "hr.benefits.read" as const,
        "hr.benefits.sensitive.read" as const,
      ],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) =>
        capability === "hr.benefits.read" ||
        capability === HR_BENEFITS_SENSITIVE_READ_CAPABILITY,
    );

    const guard = await requireHrBenefitsRead();

    expect(guard.canViewSensitive).toBe(true);
  });
});
