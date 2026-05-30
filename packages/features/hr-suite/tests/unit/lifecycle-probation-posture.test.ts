import { describe, expect, it } from "vitest";

import { deriveProbationReviewPosture } from "../../src/employee-management/employee-lifecycle-management/data/hr.workforce.lifecycle-probation.shared";

describe("lifecycle probation review posture", () => {
  const asOf = new Date("2026-05-30T12:00:00.000Z");

  it("marks past probation end as overdue", () => {
    expect(
      deriveProbationReviewPosture(
        new Date("2026-05-01T00:00:00.000Z"),
        asOf,
      ),
    ).toBe("overdue");
  });

  it("marks probation ending within 14 days as due", () => {
    expect(
      deriveProbationReviewPosture(
        new Date("2026-06-10T00:00:00.000Z"),
        asOf,
      ),
    ).toBe("due");
  });

  it("marks distant probation end as upcoming", () => {
    expect(
      deriveProbationReviewPosture(
        new Date("2026-08-01T00:00:00.000Z"),
        asOf,
      ),
    ).toBe("upcoming");
  });
});
