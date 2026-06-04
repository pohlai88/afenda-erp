import { describe, expect, it } from "vitest";

import {
  buildHrTimeClockIdempotencyKey,
  classifyHrTimeClockPunchType,
} from "../../src/time-attendance/time-clock-integration/hr.time.clock-integration-ingest.shared.server";

describe("hr timeclockintegration punch ingest", () => {
  it("classifies clock and break punch aliases", () => {
    expect(
      classifyHrTimeClockPunchType({
        punchType: "clock_in",
        breaksEnabled: true,
      }),
    ).toBe("clock_in");
    expect(
      classifyHrTimeClockPunchType({
        punchType: "break_start",
        breaksEnabled: true,
      }),
    ).toBe("break_in");
    expect(
      classifyHrTimeClockPunchType({
        punchType: "break_end",
        breaksEnabled: false,
      }),
    ).toBe("break_out");
  });

  it("builds stable idempotency keys from external punch ids", () => {
    const punchedAt = new Date("2026-05-31T08:00:00.000Z");
    expect(
      buildHrTimeClockIdempotencyKey({
        organizationId: "org_1",
        deviceId: "dev_1",
        externalPunchId: "ext-42",
        punchType: "clock_in",
        punchedAt,
      }),
    ).toBe("dev_1:ext-42");
  });
});
