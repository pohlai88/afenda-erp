import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  assertGeoCoverageComplete,
  GEO_REQUIREMENT_COVERAGE,
} from "../../src/time-attendance/geolocation-remote-checkin/hrs-geolocation-acceptance-coverage-shared";

const repoRoot = resolve(import.meta.dirname, "../../../../../");

describe("HRM-GEO acceptance coverage", () => {
  it("includes all requirement codes HRM-GEO-001 through HRM-GEO-032", () => {
    const codes = GEO_REQUIREMENT_COVERAGE.map((row) => row.code);
    for (let index = 1; index <= 32; index += 1) {
      expect(codes).toContain(`HRM-GEO-${String(index).padStart(3, "0")}`);
    }
    expect(codes).toHaveLength(32);
  });

  it("marks GEO-001..032 as shipped with on-disk evidence paths", () => {
    for (const row of GEO_REQUIREMENT_COVERAGE) {
      expect(row.status).toBe("shipped");
      expect(row.evidence.length).toBeGreaterThan(0);
      for (const evidencePath of row.evidence) {
        expect(existsSync(resolve(repoRoot, evidencePath))).toBe(true);
      }
    }
    expect(() => assertGeoCoverageComplete()).not.toThrow();
  });
});
