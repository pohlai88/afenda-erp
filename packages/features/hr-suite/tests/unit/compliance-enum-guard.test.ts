import { describe, expect, it } from "vitest";

import { toEnumMember } from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-enum-guard.shared";
import { HRM_COMPLIANCE_REQUIREMENT_STATUSES } from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-status.shared";

describe("toEnumMember", () => {
  it("returns the value when it is an allowed enum member", () => {
    expect(
      toEnumMember("overdue", HRM_COMPLIANCE_REQUIREMENT_STATUSES, "requirement status"),
    ).toBe("overdue");
  });

  it("throws when derivation returns an unexpected token", () => {
    expect(() =>
      toEnumMember("invalid", HRM_COMPLIANCE_REQUIREMENT_STATUSES, "requirement status"),
    ).toThrow(/Unexpected requirement status derivation result: invalid/);
  });
});
