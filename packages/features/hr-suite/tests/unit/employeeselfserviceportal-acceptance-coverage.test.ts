import { describe, expect, it } from "vitest";

import {
  HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE,
  assertHrWorkforceEssEnterpriseCoverage,
} from "../../src/employee-management/employee-selfservice-portal/hr.workforce.ess-coverage.shared";
import { hrWorkforceEssAuditActions } from "../../src/employee-management/employee-selfservice-portal/hr.workforce.ess.event";

const expectedRequirementCodes = Array.from(
  { length: 25 },
  (_, index) => `HRM-ESS-${String(index + 1).padStart(3, "0")}`,
);

const expectedAcceptanceCodes = Array.from(
  { length: 20 },
  (_, index) => `AC-${String(index + 1).padStart(2, "0")}`,
);

const expectedAcceptanceRequirementRefs = {
  "AC-01": ["HRM-ESS-001", "HRM-ESS-002"],
  "AC-02": ["HRM-ESS-021", "HRM-ESS-022"],
  "AC-03": ["HRM-ESS-003"],
  "AC-04": ["HRM-ESS-004"],
  "AC-05": ["HRM-ESS-005", "HRM-ESS-008"],
  "AC-06": ["HRM-ESS-006"],
  "AC-07": ["HRM-ESS-008", "HRM-ESS-018"],
  "AC-08": ["HRM-ESS-009", "HRM-ESS-010"],
  "AC-09": ["HRM-ESS-011", "HRM-ESS-012"],
  "AC-10": ["HRM-ESS-013", "HRM-ESS-014"],
  "AC-11": ["HRM-ESS-015"],
  "AC-12": ["HRM-ESS-016"],
  "AC-13": ["HRM-ESS-017"],
  "AC-14": ["HRM-ESS-020"],
  "AC-15": ["HRM-ESS-019"],
  "AC-16": ["HRM-ESS-023"],
  "AC-17": ["HRM-ESS-022"],
  "AC-18": ["HRM-ESS-024"],
  "AC-19": ["HRM-ESS-010", "HRM-ESS-015"],
  "AC-20": ["HRM-ESS-018", "HRM-ESS-019"],
} as const;

describe("Employee Self-Service Portal enterprise coverage", () => {
  it("ships ESS-001 through ESS-025 and all enterprise acceptance criteria", () => {
    expect(() => assertHrWorkforceEssEnterpriseCoverage()).not.toThrow();
    expect(HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE).toHaveLength(25);
    expect(HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(20);
    expect(
      HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE.map((entry) => entry.code),
    ).toEqual(expectedRequirementCodes);
    expect(
      HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE.map(
        (entry) => entry.code,
      ),
    ).toEqual(expectedAcceptanceCodes);
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

  it("maps each enterprise acceptance criterion to shipped HRM-ESS requirements", () => {
    const requirementCodes = new Set(
      HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE.map((entry) => entry.code),
    );

    for (const entry of HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE) {
      expect(entry.evidence.length).toBeGreaterThan(0);
      expect(
        entry.evidence.every((evidence) =>
          evidence.startsWith(
            "packages/features/hr-suite/src/employee-management/employee-selfservice-portal/",
          ),
        ),
      ).toBe(true);
    }

    for (const entry of HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE) {
      const requirementRefs = entry.evidence.map((evidence) =>
        evidence.replace(" shipped", ""),
      );
      expect(requirementRefs).toEqual(
        expectedAcceptanceRequirementRefs[
          entry.code as keyof typeof expectedAcceptanceRequirementRefs
        ],
      );
      expect(requirementRefs.every((code) => requirementCodes.has(code))).toBe(
        true,
      );
      expect(
        entry.evidence.every((evidence) =>
          /^HRM-ESS-\d{3} shipped$/.test(evidence),
        ),
      ).toBe(true);
    }
  });

  it("declares audit events for controlled self-service workflows", () => {
    expect(Object.values(hrWorkforceEssAuditActions)).toEqual(
      expect.arrayContaining([
        "hr.workforce.ess.profile-update.requested",
        "hr.workforce.ess.leave.requested",
        "hr.workforce.ess.leave.amended",
        "hr.workforce.ess.leave.cancelled",
        "hr.workforce.ess.pay-document.accessed",
        "hr.workforce.ess.claim.submitted",
        "hr.workforce.ess.document.accessed",
        "hr.workforce.ess.document.uploaded",
        "hr.workforce.ess.policy.acknowledged",
        "hr.workforce.ess.task.completed",
        "hr.workforce.ess.approval.decided",
        "hr.workforce.ess.notification.read",
        "hr.workforce.ess.consent.captured",
      ]),
    );
  });
});
