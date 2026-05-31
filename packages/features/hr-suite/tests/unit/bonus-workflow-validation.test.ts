import { describe, expect, it } from "vitest";

import {
  hasBlockingBonusValidationFlags,
  HR_BONUS_BLOCKING_VALIDATION_FLAGS,
} from "@afenda/db";

describe("HRM-BON-020 payout validation flags", () => {
  it("treats known blocking flags as blocking", () => {
    expect(
      hasBlockingBonusValidationFlags(["missing_target", "missing_achievement"]),
    ).toBe(true);
    expect(hasBlockingBonusValidationFlags([])).toBe(false);
  });

  it("documents blocking flag codes", () => {
    expect(HR_BONUS_BLOCKING_VALIDATION_FLAGS).toContain("invalid_payout_formula");
    expect(HR_BONUS_BLOCKING_VALIDATION_FLAGS).toContain("ineligible_employee");
  });
});
