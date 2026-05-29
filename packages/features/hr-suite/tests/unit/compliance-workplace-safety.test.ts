import { describe, expect, it } from "vitest";

import {
  deriveEffectiveWorkplaceSafetyRequirementStatus,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-status.shared";
import { resolveWorkplaceSafetyRequirementListBadgeTone } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-list.shared";

describe("HRM-CMP-006 workplace safety requirement status", () => {
  const now = new Date("2026-06-01T12:00:00.000Z");

  it("derives overdue from pending when due date is in the past", () => {
    expect(
      deriveEffectiveWorkplaceSafetyRequirementStatus({
        status: "pending",
        dueDate: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("overdue");
  });

  it("derives at_risk within 14 days of due date", () => {
    expect(
      deriveEffectiveWorkplaceSafetyRequirementStatus({
        status: "pending",
        dueDate: new Date("2026-06-10T00:00:00.000Z"),
        now,
      }),
    ).toBe("at_risk");
  });

  it("marks compliant rows expired when certification due date is past", () => {
    expect(
      deriveEffectiveWorkplaceSafetyRequirementStatus({
        status: "compliant",
        dueDate: new Date("2026-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("expired");
  });

  it("maps overdue posture to critical list badge tone", () => {
    expect(resolveWorkplaceSafetyRequirementListBadgeTone("overdue")).toBe(
      "critical",
    );
  });
});
