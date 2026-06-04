import { describe, expect, it } from "vitest";

import {
  assertPayrollCoverageComplete,
  PAYROLL_ACCEPTANCE_CRITERIA_COVERAGE,
  PAYROLL_REQUIREMENT_COVERAGE,
} from "./hr.payroll.processing-acceptance-coverage.shared";

describe("HRM-PAY-001..030 acceptance coverage", () => {
  it("maps all 30 payroll requirements", () => {
    expect(PAYROLL_REQUIREMENT_COVERAGE).toHaveLength(30);
    assertPayrollCoverageComplete();
  });

  it("maps all 20 acceptance criteria", () => {
    expect(PAYROLL_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(20);
    for (const row of PAYROLL_ACCEPTANCE_CRITERIA_COVERAGE) {
      expect(row.requirements.length).toBeGreaterThan(0);
      expect(row.status).toBe("shipped");
    }
  });

  it("covers PAY-004..011 calculation requirements", () => {
    const calcCodes = PAYROLL_REQUIREMENT_COVERAGE.filter((row) => {
      const num = Number(row.code.replace("HRM-PAY-", ""));
      return num >= 4 && num <= 11;
    });
    expect(calcCodes.every((row) => row.status === "shipped")).toBe(true);
  });
});
