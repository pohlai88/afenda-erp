import { describe, expect, it } from "vitest";

import {
  assertLamCoverageComplete,
  LAM_REQUIREMENT_COVERAGE,
} from "../../src/time-attendance/leave-attendance-management/data/hr.time.lam-acceptance-coverage.shared";

describe("LAM-001..030 acceptance coverage", () => {
  it("includes all requirement codes HRM-LAM-001 through HRM-LAM-030", () => {
    const codes = LAM_REQUIREMENT_COVERAGE.map((row) => row.code);
    for (let i = 1; i <= 30; i += 1) {
      const padded = String(i).padStart(3, "0");
      expect(codes).toContain(`HRM-LAM-${padded}`);
    }
    expect(codes).toHaveLength(30);
  });

  it("marks LAM-001..030 as shipped with evidence paths", () => {
    for (const row of LAM_REQUIREMENT_COVERAGE) {
      expect(row.status).toBe("shipped");
      expect(row.evidence.length).toBeGreaterThan(0);
    }
    expect(() => assertLamCoverageComplete()).not.toThrow();
  });
});
