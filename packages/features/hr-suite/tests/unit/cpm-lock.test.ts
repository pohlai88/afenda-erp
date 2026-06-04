import { describe, expect, it } from "vitest";

import { isHrCompensationRecommendationLocked } from "../../../../db/src/hr-compensation-planning.shared";

import { isHrCpmRecommendationLocked } from "../../src/payroll-compensation/compensation-planning-modeling/hr.payroll.cpm-lock.shared";

describe("HRM-CPM-025 recommendation lock", () => {
  it("locks when status is approved", () => {
    expect(isHrCompensationRecommendationLocked("approved", null)).toBe(true);
    expect(isHrCpmRecommendationLocked("approved", null)).toBe(true);
  });

  it("locks when lockedAt is set regardless of status", () => {
    const lockedAt = new Date("2026-05-01T00:00:00.000Z");
    expect(
      isHrCompensationRecommendationLocked("pending_approval", lockedAt),
    ).toBe(true);
    expect(isHrCpmRecommendationLocked("pending_approval", lockedAt)).toBe(
      true,
    );
  });

  it("allows edits for draft and returned statuses without lockedAt", () => {
    expect(isHrCpmRecommendationLocked("draft", null)).toBe(false);
    expect(isHrCpmRecommendationLocked("returned", null)).toBe(false);
  });
});
