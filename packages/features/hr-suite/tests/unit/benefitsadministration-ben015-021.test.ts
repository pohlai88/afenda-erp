import { describe, expect, it } from "vitest";

import { HrBenefitsCommandError } from "@afenda/db";
import { buildBenefitDeductionCode } from "../../../../db/src/hr-benefits-deductions";

import { toBenefitsActionFailure } from "../../src/payroll-compensation/benefits-administration/data/hr.payroll.benefits-action-result.shared";
import {
  BENEFITS_ACCEPTANCE_COVERAGE,
  BENEFITS_REQUIREMENT_COVERAGE,
} from "../../src/payroll-compensation/benefits-administration/data/hr.payroll.benefits-acceptance-coverage.shared";

describe("HRM-BEN-015 … HRM-BEN-021 coverage matrix", () => {
  it("marks requirement codes as shipped", () => {
    const codes = BENEFITS_REQUIREMENT_COVERAGE.map((entry) => entry.code);
    expect(codes).toEqual([
      "HRM-BEN-015",
      "HRM-BEN-016",
      "HRM-BEN-017",
      "HRM-BEN-018",
      "HRM-BEN-019",
      "HRM-BEN-020",
      "HRM-BEN-021",
      "HRM-BEN-022",
      "HRM-BEN-023",
      "HRM-BEN-024",
      "HRM-BEN-025",
      "HRM-BEN-026",
      "HRM-BEN-027",
      "HRM-BEN-028",
    ]);
    for (const entry of BENEFITS_REQUIREMENT_COVERAGE) {
      expect(entry.status).toBe("shipped");
      expect(entry.evidence.length).toBeGreaterThan(0);
    }
  });

  it("covers acceptance criteria #15 and #18", () => {
    const acceptanceNumbers = BENEFITS_ACCEPTANCE_COVERAGE.map(
      (entry) => entry.acceptanceNo,
    );
    expect(acceptanceNumbers).toContain(15);
    expect(acceptanceNumbers).toContain(18);
  });
});

describe("benefits payroll deduction reference helpers", () => {
  it("builds stable deduction codes from plan codes", () => {
    expect(buildBenefitDeductionCode("medical-2026")).toBe("BEN-MEDICAL-2026");
  });
});

describe("benefits action failure mapping", () => {
  it("maps enrollment approval guard errors", () => {
    const result = toBenefitsActionFailure(
      new HrBenefitsCommandError("enrollment_not_pending"),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("pending approval");
    }
  });
});
