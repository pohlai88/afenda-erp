import { describe, expect, it } from "vitest";

import {
  deriveEffectiveLaborLawRequirementStatus,
  worstComplianceRequirementStatus,
} from "../../src/employee-management/compliance-regulatory-tracking/hr.workforce.compliance-status.shared";
import { resolveLaborLawRequirementListBadgeTone } from "../../src/employee-management/compliance-regulatory-tracking/hr.workforce.compliance-list.shared";

describe("HRM-CMP-002 labor law requirement status", () => {
  const now = new Date("2026-06-01T12:00:00.000Z");

  it("derives overdue from pending when due date is in the past", () => {
    expect(
      deriveEffectiveLaborLawRequirementStatus({
        status: "pending",
        dueDate: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("overdue");
  });

  it("derives at_risk within 14 days of due date", () => {
    expect(
      deriveEffectiveLaborLawRequirementStatus({
        status: "pending",
        dueDate: new Date("2026-06-10T00:00:00.000Z"),
        now,
      }),
    ).toBe("at_risk");
  });

  it("preserves terminal statuses", () => {
    expect(
      deriveEffectiveLaborLawRequirementStatus({
        status: "compliant",
        dueDate: new Date("2026-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("compliant");
  });

  it("selects worst posture across employee requirements", () => {
    expect(
      worstComplianceRequirementStatus(["compliant", "pending", "overdue"]),
    ).toBe("overdue");
  });

  it("maps overdue labor law posture to critical list badge tone", () => {
    expect(resolveLaborLawRequirementListBadgeTone("overdue")).toBe("critical");
  });
});
