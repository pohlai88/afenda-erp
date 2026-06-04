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

import {
  HR_BONUS_FINANCE_READ_CAPABILITY,
  HR_BONUS_SENSITIVE_READ_CAPABILITY,
  requireHrBonusRead,
} from "../../src/payroll-compensation/bonus-incentive-management/hr.payroll.bonus-access.policy.server";

describe("HRM-BON-029 bonus access policy", () => {
  it("requires hr.bonus.read and denies sensitive detail without hr.bonus.sensitive.read", async () => {
    const context = {
      userId: "user-1",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "member" as const,
      capabilities: ["hr.bonus.read" as const],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) => capability === "hr.bonus.read",
    );

    const guard = await requireHrBonusRead();

    expect(requireExecutionPermission).toHaveBeenCalledWith(
      context,
      "hr.bonus.read",
    );
    expect(hasExecutionPermission).toHaveBeenCalledWith(
      context,
      HR_BONUS_SENSITIVE_READ_CAPABILITY,
    );
    expect(guard.canViewSensitive).toBe(false);
  });

  it("allows sensitive and finance flags when capabilities are granted", async () => {
    const context = {
      userId: "user-2",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "admin" as const,
      capabilities: [
        "hr.bonus.read" as const,
        HR_BONUS_SENSITIVE_READ_CAPABILITY,
        HR_BONUS_FINANCE_READ_CAPABILITY,
      ],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) =>
        capability === "hr.bonus.read" ||
        capability === HR_BONUS_SENSITIVE_READ_CAPABILITY ||
        capability === HR_BONUS_FINANCE_READ_CAPABILITY,
    );

    const guard = await requireHrBonusRead();
    expect(guard.canViewSensitive).toBe(true);
    expect(guard.canViewFinance).toBe(true);
  });
});
