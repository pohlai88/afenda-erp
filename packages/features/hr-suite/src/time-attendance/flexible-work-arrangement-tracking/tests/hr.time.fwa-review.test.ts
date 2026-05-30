import { describe, expect, it } from "vitest";

import { computeHrFwaLifecycleDates } from "@afenda/db";

describe("FWA lifecycle dates (HRM-FWA-028)", () => {
  it("schedules review date from effective start", () => {
    const effectiveFrom = new Date("2026-01-01T00:00:00.000Z");
    const { reviewDate, renewalDate } = computeHrFwaLifecycleDates({
      effectiveFrom,
      effectiveTo: null,
    });

    expect(reviewDate.toISOString().slice(0, 10)).toBe("2026-04-01");
    expect(renewalDate).toBeNull();
  });

  it("schedules renewal reminder before effective end", () => {
    const effectiveFrom = new Date("2026-01-01T00:00:00.000Z");
    const effectiveTo = new Date("2026-12-31T00:00:00.000Z");
    const { renewalDate } = computeHrFwaLifecycleDates({
      effectiveFrom,
      effectiveTo,
      renewalLeadDays: 30,
    });

    expect(renewalDate?.toISOString().slice(0, 10)).toBe("2026-12-01");
  });
});
