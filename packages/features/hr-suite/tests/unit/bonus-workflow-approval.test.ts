import { describe, expect, it } from "vitest";

import { resolveHrBonusApprovalSteps } from "@afenda/db";

describe("HRM-BON-022 bonus approval routing", () => {
  it("includes default manager and finance steps for standard payout", () => {
    const steps = resolveHrBonusApprovalSteps({
      routingConfig: null,
      context: {
        planType: "annual_bonus",
        payoutAmount: 10_000,
        legalEntityCode: "MY01",
        departmentId: "dept-1",
        grade: "G5",
        managerEmployeeId: "mgr-1",
        budgetImpact: 10_000,
      },
    });

    expect(steps.map((step) => step.role)).toEqual(["manager", "hr", "finance"]);
  });

  it("filters finance step when amount is below threshold", () => {
    const steps = resolveHrBonusApprovalSteps({
      routingConfig: null,
      context: {
        planType: "sales_commission",
        payoutAmount: 1_000,
        legalEntityCode: null,
        departmentId: null,
        grade: null,
        managerEmployeeId: "mgr-1",
      },
    });

    expect(steps.map((step) => step.role)).toEqual(["manager", "hr"]);
  });
});
