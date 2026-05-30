import { describe, expect, it } from "vitest";

import {
  assertLamCoverageComplete,
  LAM_REQUIREMENT_COVERAGE,
} from "../../src/time-attendance/leave-attendance-management/data/lam-acceptance-coverage.shared";

describe("LAM-021..030 acceptance coverage", () => {
  it("includes all advanced requirement codes", () => {
    const codes = LAM_REQUIREMENT_COVERAGE.map((row) => row.code);
    for (let i = 21; i <= 30; i += 1) {
      const padded = String(i).padStart(3, "0");
      expect(codes).toContain(`HRM-LAM-${padded}`);
    }
  });

  it("marks LAM-021..030 as shipped with evidence paths", () => {
    for (const row of LAM_REQUIREMENT_COVERAGE) {
      expect(row.status).toBe("shipped");
      expect(row.evidence.length).toBeGreaterThan(0);
    }
    expect(() => assertLamCoverageComplete()).not.toThrow();
  });
});
