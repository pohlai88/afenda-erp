import { describe, expect, it } from "vitest";

import {
  assertFwaCoverageComplete,
  FWA_REQUIREMENT_COVERAGE,
} from "../data/hr.time.fwa-acceptance-coverage.shared";

describe("FWA acceptance coverage matrix", () => {
  it("lists all 32 HRM-FWA requirements", () => {
    expect(FWA_REQUIREMENT_COVERAGE).toHaveLength(32);
    const codes = FWA_REQUIREMENT_COVERAGE.map((row) => row.code);
    for (let index = 1; index <= 32; index += 1) {
      const padded = String(index).padStart(3, "0");
      expect(codes).toContain(`HRM-FWA-${padded}`);
    }
  });

  it("documents shipped lifecycle, notification, report, permission, and audit requirements", () => {
    const shipped = new Set(
      FWA_REQUIREMENT_COVERAGE.filter((row) => row.status === "shipped").map(
        (row) => row.code,
      ),
    );
    for (const code of [
      "HRM-FWA-028",
      "HRM-FWA-029",
      "HRM-FWA-030",
      "HRM-FWA-031",
      "HRM-FWA-032",
    ] as const) {
      expect(shipped.has(code)).toBe(true);
    }
  });

  it("assertFwaCoverageComplete throws when partial requirements remain", () => {
    expect(() => assertFwaCoverageComplete()).toThrow(/fwa_acceptance_incomplete/);
  });
});
