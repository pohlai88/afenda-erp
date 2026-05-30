import { describe, expect, it } from "vitest";

import { derivePendingTransitionDuePosture } from "../../src/employee-management/employee-lifecycle-management/data/hr.workforce.lifecycle-transition.shared";

describe("derivePendingTransitionDuePosture", () => {
  it("marks transitions at or before asOf as due", () => {
    const asOf = new Date("2026-06-01T12:00:00.000Z");
    expect(
      derivePendingTransitionDuePosture(
        new Date("2026-06-01T10:00:00.000Z"),
        asOf,
      ),
    ).toBe("due");
    expect(
      derivePendingTransitionDuePosture(
        new Date("2026-06-01T12:00:00.000Z"),
        asOf,
      ),
    ).toBe("due");
  });

  it("marks future effective dates as scheduled", () => {
    const asOf = new Date("2026-06-01T12:00:00.000Z");
    expect(
      derivePendingTransitionDuePosture(
        new Date("2026-06-02T00:00:00.000Z"),
        asOf,
      ),
    ).toBe("scheduled");
  });
});
