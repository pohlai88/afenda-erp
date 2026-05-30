import { describe, expect, it } from "vitest";

import { detectAttendanceExceptions } from "@afenda/db";

describe("detectAttendanceExceptions (LAM-022)", () => {
  const policy = {
    graceMinutesLate: 15,
    standardStartMinutes: 540,
    standardEndMinutes: 1020,
  };

  it("flags absent when no punches", () => {
    const exceptions = detectAttendanceExceptions({ punches: [], policy });
    expect(exceptions.some((e) => e.code === "absent")).toBe(true);
  });

  it("flags late arrival after grace", () => {
    const workDate = new Date("2026-05-01T10:30:00.000Z");
    const exceptions = detectAttendanceExceptions({
      punches: [{ punchType: "clock_in", punchedAt: workDate }],
      policy,
    });
    expect(exceptions.some((e) => e.code === "late_arrival")).toBe(true);
  });

  it("flags missing clock-out", () => {
    const exceptions = detectAttendanceExceptions({
      punches: [
        {
          punchType: "clock_in",
          punchedAt: new Date("2026-05-01T08:00:00.000Z"),
        },
      ],
      policy,
    });
    expect(exceptions.some((e) => e.code === "missing_clock_out")).toBe(true);
  });
});
