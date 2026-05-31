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
  HR_EXPENSE_FINANCE_READ_CAPABILITY,
  HR_EXPENSE_SENSITIVE_READ_CAPABILITY,
  requireHrExpenseRead,
} from "../../src/payroll-compensation/expenses-reimbursement/policies/hr.payroll.expense-access.policy.server";

describe("HRM-EXP-026 expense access policy", () => {
  it("requires hr.expense.read and denies finance without hr.expense.finance.read", async () => {
    const context = {
      userId: "user-1",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "member" as const,
      capabilities: ["hr.expense.read" as const],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) => capability === "hr.expense.read",
    );

    const guard = await requireHrExpenseRead();

    expect(requireExecutionPermission).toHaveBeenCalledWith(
      context,
      "hr.expense.read",
    );
    expect(guard.canViewFinance).toBe(false);
    expect(guard.canViewSensitive).toBe(false);
  });

  it("allows finance and sensitive flags when capabilities are granted", async () => {
    const context = {
      userId: "user-2",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "admin" as const,
      capabilities: [
        "hr.expense.read" as const,
        HR_EXPENSE_SENSITIVE_READ_CAPABILITY,
        HR_EXPENSE_FINANCE_READ_CAPABILITY,
      ],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) =>
        capability === "hr.expense.read" ||
        capability === HR_EXPENSE_SENSITIVE_READ_CAPABILITY ||
        capability === HR_EXPENSE_FINANCE_READ_CAPABILITY,
    );

    const guard = await requireHrExpenseRead();
    expect(guard.canViewSensitive).toBe(true);
    expect(guard.canViewFinance).toBe(true);
  });
});
