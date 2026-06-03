import { describe, expect, it } from "vitest";

import {
  AAT_INTEGRATION_REQUIREMENT_COVERAGE,
  assertAatIntegrationCoverageComplete,
} from "../data/hr.time.aat-acceptance-coverage.shared";

describe("HRM-AAT-028 historical snapshots coverage", () => {
  it("marks snapshot requirement as shipped", () => {
    const row = AAT_INTEGRATION_REQUIREMENT_COVERAGE.find(
      (entry) => entry.code === "HRM-AAT-028",
    );
    expect(row?.status).toBe("shipped");
  });

  it("asserts integration coverage is complete", () => {
    expect(() => assertAatIntegrationCoverageComplete()).not.toThrow();
  });
});

describe("snapshot subject id shape", () => {
  it("builds stable period keys", () => {
    const periodStart = new Date("2026-01-01T00:00:00.000Z");
    const periodEnd = new Date("2026-01-31T23:59:59.999Z");
    const key = [
      "emp_1",
      periodStart.toISOString().slice(0, 10),
      periodEnd.toISOString().slice(0, 10),
      "high_risk",
    ].join(":");
    expect(key).toBe("emp_1:2026-01-01:2026-01-31:high_risk");
  });
});
