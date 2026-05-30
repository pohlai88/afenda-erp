import { describe, expect, it } from "vitest";

import { deriveHrPositionOccupancyStatus } from "@afenda/db";

describe("hr org occupancy derivation", () => {
  it("derives filled and vacant from active positions", () => {
    expect(
      deriveHrPositionOccupancyStatus({
        positionStatus: "active",
        hasActiveAssignee: true,
      }),
    ).toBe("filled");
    expect(
      deriveHrPositionOccupancyStatus({
        positionStatus: "active",
        hasActiveAssignee: false,
      }),
    ).toBe("vacant");
  });

  it("preserves planned, frozen, and closed stored statuses", () => {
    expect(
      deriveHrPositionOccupancyStatus({
        positionStatus: "planned",
        hasActiveAssignee: false,
      }),
    ).toBe("planned");
    expect(
      deriveHrPositionOccupancyStatus({
        positionStatus: "frozen",
        hasActiveAssignee: true,
      }),
    ).toBe("frozen");
    expect(
      deriveHrPositionOccupancyStatus({
        positionStatus: "closed",
        hasActiveAssignee: false,
      }),
    ).toBe("closed");
  });
});
