import { describe, expect, it } from "vitest";

import {
  BONUS_ACCEPTANCE_CRITERIA_COVERAGE,
  BONUS_REQUIREMENT_COVERAGE,
} from "../../src/payroll-compensation/bonus-incentive-management/hr.payroll.bonus-acceptance-coverage.shared";

describe("HRM-BON-025..030 acceptance coverage", () => {
  it("marks BON-025 through BON-030 as shipped with evidence", () => {
    const codes = BONUS_REQUIREMENT_COVERAGE.map((row) => row.code);
    for (let n = 25; n <= 30; n += 1) {
      const code = `HRM-BON-${String(n).padStart(3, "0")}`;
      expect(codes).toContain(code);
      const row = BONUS_REQUIREMENT_COVERAGE.find((entry) => entry.code === code);
      expect(row?.status).toBe("shipped");
      expect(row?.evidence.length).toBeGreaterThan(0);
    }
  });

  it("maps enterprise acceptance criteria 19–25 for payout compliance slice", () => {
    const criteria = BONUS_ACCEPTANCE_CRITERIA_COVERAGE.filter((row) =>
      [19, 20, 21, 23, 24, 25].includes(row.criterion),
    ).map((row) => row.criterion);
    expect(criteria).toEqual([19, 20, 21, 23, 24, 25]);
  });
});
