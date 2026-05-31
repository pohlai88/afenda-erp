import { describe, expect, it } from "vitest";

import { resolveHrCompensationApprovalSteps } from "../../../../db/src/hr-compensation-planning-approval.shared";

describe("HRM-CPM-023/024 compensation approval routing", () => {
  it("includes default manager and finance steps for standard budget impact", () => {
    const steps = resolveHrCompensationApprovalSteps({
      approvalRules: null,
      context: {
        budgetImpact: 10_000,
        proposedSalary: 110_000,
        increasePercent: 10,
        legalEntityCode: "MY01",
        departmentId: "dept-1",
        grade: "G5",
        managerEmployeeId: "mgr-1",
      },
    });

    expect(steps.map((step) => step.role)).toEqual(["manager", "hr", "finance"]);
  });

  it("filters finance step when budget impact is below threshold", () => {
    const steps = resolveHrCompensationApprovalSteps({
      approvalRules: null,
      context: {
        budgetImpact: 1_000,
        proposedSalary: 51_000,
        increasePercent: 2,
        legalEntityCode: null,
        departmentId: null,
        grade: null,
        managerEmployeeId: "mgr-1",
      },
    });

    expect(steps.map((step) => step.role)).toEqual(["manager", "hr"]);
  });

  it("routes by legal entity, department, grade, and percent", () => {
    const steps = resolveHrCompensationApprovalSteps({
      approvalRules: {
        steps: [
          { role: "manager", order: 0, legalEntityCodes: ["MY01"] },
          { role: "hr", order: 1, departmentIds: ["dept-1"], minPercent: 5 },
          {
            role: "executive",
            order: 2,
            grades: ["G7"],
            minPercent: 15,
            budgetImpactMin: 20_000,
          },
        ],
      },
      context: {
        budgetImpact: 25_000,
        proposedSalary: 125_000,
        increasePercent: 8,
        legalEntityCode: "MY01",
        departmentId: "dept-1",
        grade: "G7",
        managerEmployeeId: "mgr-1",
      },
    });

    expect(steps.map((step) => step.role)).toEqual(["manager", "hr"]);
  });
});
