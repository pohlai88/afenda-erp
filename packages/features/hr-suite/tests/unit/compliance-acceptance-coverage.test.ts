import { describe, expect, it } from "vitest";

import {
  HR_WORKFORCE_COMPLIANCE_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_WORKFORCE_COMPLIANCE_REQUIREMENT_COVERAGE,
  assertHrWorkforceComplianceEnterpriseCoverage,
} from "../../src/employee-management/compliance-regulatory-tracking/hr.workforce.compliance-coverage.shared";
import { HR_COMPLIANCE_LIST_SURFACE_KEYS } from "../../src/employee-management/compliance-regulatory-tracking/metadata";

describe("Compliance Regulatory Tracking enterprise coverage", () => {
  it("ships HRM-CMP-001 through HRM-CMP-025 and all acceptance criteria", () => {
    expect(() => assertHrWorkforceComplianceEnterpriseCoverage()).not.toThrow();
    expect(HR_WORKFORCE_COMPLIANCE_REQUIREMENT_COVERAGE).toHaveLength(25);
    expect(HR_WORKFORCE_COMPLIANCE_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(
      20,
    );
    expect(HR_COMPLIANCE_LIST_SURFACE_KEYS).toHaveLength(15);
    expect(
      HR_WORKFORCE_COMPLIANCE_REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
    expect(
      HR_WORKFORCE_COMPLIANCE_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });
});
