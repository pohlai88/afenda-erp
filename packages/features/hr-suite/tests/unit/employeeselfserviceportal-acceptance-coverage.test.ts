import { describe, expect, it } from "vitest";

import {
  HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE,
  assertHrWorkforceEssEnterpriseCoverage,
} from "../../src/employee-management/employee-selfservice-portal/data/hr.workforce.ess-coverage.shared";
import { hrWorkforceEssAuditActions } from "../../src/employee-management/employee-selfservice-portal/events/hr.workforce.ess.event";

describe("Employee Self-Service Portal enterprise coverage", () => {
  it("ships ESS-001 through ESS-025 and all enterprise acceptance criteria", () => {
    expect(() => assertHrWorkforceEssEnterpriseCoverage()).not.toThrow();
    expect(HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE).toHaveLength(25);
    expect(HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(20);
    expect(
      HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "shipped",
      ),
    ).toBe(true);
    expect(
      HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped",
      ),
    ).toBe(true);
  });

  it("declares audit events for controlled self-service workflows", () => {
    expect(Object.values(hrWorkforceEssAuditActions)).toEqual(
      expect.arrayContaining([
        "hr.workforce.ess.profile-update.requested",
        "hr.workforce.ess.leave.requested",
        "hr.workforce.ess.claim.submitted",
        "hr.workforce.ess.document.accessed",
        "hr.workforce.ess.policy.acknowledged",
        "hr.workforce.ess.approval.decided",
      ]),
    );
  });
});
