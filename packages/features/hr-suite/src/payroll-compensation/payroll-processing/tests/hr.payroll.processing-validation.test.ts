import { describe, expect, it } from "vitest";

import {
  assertHrPayrollCanFinalize,
  runHrPayrollValidationChecks,
} from "../data/hr.payroll.processing-validation.shared";

describe("HRM-PAY-017..020 payroll validation", () => {
  it("flags missing pay group and bank account as blocking", () => {
    const result = runHrPayrollValidationChecks({
      payrollRunId: "run-1",
      organizationId: "org-1",
      employees: [
        {
          employeeId: "emp-1",
          employeeLabel: "Alex Example",
          payGroupId: null,
          bankAccountRef: null,
          baseSalaryAmount: 5000,
        },
      ],
    });

    expect(result.blockingCount).toBeGreaterThan(0);
    expect(result.canFinalize).toBe(false);
    expect(result.issues.some((i) => i.code === "missing_pay_group")).toBe(true);
  });

  it("prevents finalization when blocking issues exist", () => {
    const result = runHrPayrollValidationChecks({
      payrollRunId: "run-1",
      organizationId: "org-1",
      employees: [],
    });

    expect(() => assertHrPayrollCanFinalize(result)).toThrow(
      /cannot be finalized/i,
    );
  });

  it("flags abnormal variance against previous cycle", () => {
    const result = runHrPayrollValidationChecks({
      payrollRunId: "run-1",
      organizationId: "org-1",
      employees: [
        {
          employeeId: "emp-1",
          employeeLabel: "Alex Example",
          payGroupId: "grp-1",
          bankAccountRef: "bank-1",
          baseSalaryAmount: 5000,
        },
      ],
      currentCycleAmounts: [{ employeeId: "emp-1", grossAmount: 6000, netAmount: 6000 }],
      previousCycleAmounts: [{ employeeId: "emp-1", grossAmount: 4000, netAmount: 4000 }],
      varianceThresholdPercent: 25,
    });

    expect(result.issues.some((i) => i.code === "abnormal_variance")).toBe(true);
  });
});
