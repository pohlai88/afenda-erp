import { describe, expect, it } from "vitest";

import {
  FWA_REQUIREMENT_COVERAGE,
} from "../../src/time-attendance/flexible-work-arrangement-tracking/data/hr.time.fwa-acceptance-coverage.shared";

describe("FWA-009..017 acceptance coverage", () => {
  it("documents shipped requirements HRM-FWA-009 through HRM-FWA-017", () => {
    const scoped = FWA_REQUIREMENT_COVERAGE.filter((row) => {
      const number = Number(row.code.replace("HRM-FWA-", ""));
      return number >= 9 && number <= 17;
    });

    expect(scoped.map((row) => row.code)).toEqual([
      "HRM-FWA-009",
      "HRM-FWA-010",
      "HRM-FWA-011",
      "HRM-FWA-012",
      "HRM-FWA-013",
      "HRM-FWA-014",
      "HRM-FWA-015",
      "HRM-FWA-016",
      "HRM-FWA-017",
    ]);
    expect(scoped.every((row) => row.status === "shipped")).toBe(true);
    expect(
      scoped.every((row) =>
        row.evidence.some((entry) => entry.includes("packages/features/hr-suite")),
      ),
    ).toBe(true);
  });
});
