import { describe, expect, it, vi } from "vitest";

vi.mock("@afenda/kernel/execution", () => ({
  requireExecutionContext: vi.fn(),
  requireExecutionPermission: vi.fn(),
  hasExecutionPermission: vi.fn(
    (
      context: { readonly capabilities: readonly string[] },
      capability: string,
    ) => context.capabilities.includes(capability),
  ),
}));

import { requireExecutionContext } from "@afenda/kernel/execution";

import {
  requireHrWorkforceEssApprove,
  requireHrWorkforceEssRead,
  requireHrWorkforceEssWrite,
} from "../../src/employee-management/employee-selfservice-portal/hr.workforce.ess-access.policy.server";

function context(input: {
  readonly role?: "staff" | "manager" | "admin" | "owner";
  readonly capabilities: readonly string[];
}) {
  return {
    userId: "user_ess_employee",
    organizationId: "org-ess-policy",
    organizationSlug: "ess-policy",
    locale: "en-MY",
    role: input.role ?? "staff",
    capabilities: input.capabilities,
  };
}

describe("Employee Self-Service Portal access policy", () => {
  it("keeps write permission self-scoped unless organization scope is explicit", async () => {
    vi.mocked(requireExecutionContext).mockResolvedValue(
      context({ capabilities: ["hr.ess.write"] }) as never,
    );

    const guard = await requireHrWorkforceEssWrite();

    await expect(
      guard.resolveVisibleEmployeeIds({ selfEmployeeId: "ess-employee-1" }),
    ).resolves.toEqual(["ess-employee-1"]);
  });

  it("limits approval scope to supplied managed employees for non-leadership users", async () => {
    vi.mocked(requireExecutionContext).mockResolvedValue(
      context({
        role: "manager",
        capabilities: ["hr.ess.approve"],
      }) as never,
    );

    const guard = await requireHrWorkforceEssApprove();

    await expect(
      guard.resolveVisibleEmployeeIds({
        selfEmployeeId: "ess-manager-1",
        managedEmployeeIds: ["ess-employee-1"],
      }),
    ).resolves.toEqual(["ess-employee-1"]);
  });

  it("allows leadership readers to resolve organization scope", async () => {
    vi.mocked(requireExecutionContext).mockResolvedValue(
      context({
        role: "admin",
        capabilities: ["hr.ess.read"],
      }) as never,
    );

    const guard = await requireHrWorkforceEssRead();

    await expect(guard.resolveVisibleEmployeeIds()).resolves.toBeNull();
  });
});
