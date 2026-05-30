import { describe, expect, it } from "vitest";

import {
  assertHrBenefitCoverageStatusTransition,
  HrBenefitsCommandError,
  HR_BENEFIT_COVERAGE_STATUSES,
  resolveBenefitCoverageStatusForEmploymentChange,
} from "@afenda/db";
import { maskBenefitsSensitiveDisplayText } from "../../src/payroll-compensation/benefits-administration/data/hr.payroll.benefits-sensitive-access.shared";

describe("HRM-BEN-022 coverage status", () => {
  it("declares all governed coverage statuses", () => {
    expect(HR_BENEFIT_COVERAGE_STATUSES).toEqual([
      "pending",
      "active",
      "waived",
      "suspended",
      "terminated",
      "expired",
    ]);
  });

  it("allows pending to active and blocks terminal transitions", () => {
    expect(() =>
      assertHrBenefitCoverageStatusTransition("pending", "active"),
    ).not.toThrow();
    expect(() =>
      assertHrBenefitCoverageStatusTransition("terminated", "active"),
    ).toThrow(HrBenefitsCommandError);
  });
});

describe("HRM-BEN-023 employment-driven coverage", () => {
  it("maps exit employment statuses to terminated coverage", () => {
    expect(resolveBenefitCoverageStatusForEmploymentChange("terminated")).toBe(
      "terminated",
    );
    expect(resolveBenefitCoverageStatusForEmploymentChange("separated")).toBe(
      "terminated",
    );
    expect(resolveBenefitCoverageStatusForEmploymentChange("active")).toBeNull();
  });

  it("maps suspended employment to suspended coverage", () => {
    expect(resolveBenefitCoverageStatusForEmploymentChange("suspended")).toBe(
      "suspended",
    );
  });
});

describe("HRM-BEN-027 sensitive access", () => {
  it("masks contribution amounts without sensitive read", () => {
    expect(maskBenefitsSensitiveDisplayText("125.50", false)).toBe("Restricted");
    expect(maskBenefitsSensitiveDisplayText("125.50", true)).toBe("125.50");
  });
});
