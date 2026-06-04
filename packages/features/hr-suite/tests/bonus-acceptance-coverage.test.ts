import { describe, expect, it } from "vitest";

import { BONUS_REQUIREMENT_COVERAGE } from "../src/payroll-compensation/bonus-incentive-management/hr.payroll.bonus-acceptance-coverage.shared";

const BON_007_012_CODES = [
  "HRM-BON-007",
  "HRM-BON-008",
  "HRM-BON-009",
  "HRM-BON-010",
  "HRM-BON-011",
  "HRM-BON-012",
] as const;

describe("BON-007..012 acceptance coverage matrix", () => {
  it("marks BON-007 through BON-012 as shipped", () => {
    const slice = BONUS_REQUIREMENT_COVERAGE.filter((entry) =>
      (BON_007_012_CODES as readonly string[]).includes(entry.code),
    );
    const codes = slice.map((entry) => entry.code);
    expect(codes).toEqual([...BON_007_012_CODES]);
    for (const entry of slice) {
      expect(entry.status).toBe("shipped");
      expect(entry.evidence.length).toBeGreaterThan(0);
    }
  });
});
