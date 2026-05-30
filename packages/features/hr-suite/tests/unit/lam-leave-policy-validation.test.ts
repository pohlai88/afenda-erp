import { describe, expect, it } from "vitest";

import {
  assertMinimumNoticePeriod,
  assertNoBlackoutConflict,
  assertNoOverlappingLeave,
  HrLeaveValidationError,
} from "@afenda/db";

describe("LAM-011 leave application policy validation", () => {
  it("rejects insufficient notice period", () => {
    const startAt = new Date("2026-06-10T00:00:00.000Z");
    const submittedAt = new Date("2026-06-09T00:00:00.000Z");

    expect(() =>
      assertMinimumNoticePeriod({
        startAt,
        submittedAt,
        minNoticeDays: 3,
      }),
    ).toThrow(HrLeaveValidationError);
  });

  it("rejects blackout overlap", () => {
    expect(() =>
      assertNoBlackoutConflict({
        leaveType: "annual",
        startAt: new Date("2026-12-20T00:00:00.000Z"),
        endAt: new Date("2026-12-22T00:00:00.000Z"),
        blackoutPeriods: [
          {
            id: "blk-1",
            label: "Year-end freeze",
            startAt: new Date("2026-12-15T00:00:00.000Z"),
            endAt: new Date("2026-12-31T00:00:00.000Z"),
            leaveTypes: ["annual"],
          },
        ],
      }),
    ).toThrow(HrLeaveValidationError);
  });

  it("rejects overlapping active leave", () => {
    expect(() =>
      assertNoOverlappingLeave({
        candidate: {
          employeeId: "emp-1",
          leaveType: "annual",
          startAt: new Date("2026-07-01T00:00:00.000Z"),
          endAt: new Date("2026-07-05T00:00:00.000Z"),
          durationDays: 5,
        },
        existing: [
          {
            id: "req-1",
            status: "pending",
            startAt: new Date("2026-07-03T00:00:00.000Z"),
            endAt: new Date("2026-07-10T00:00:00.000Z"),
          },
        ],
      }),
    ).toThrow(HrLeaveValidationError);
  });
});
