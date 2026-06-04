import { describe, expect, it } from "vitest";

import {
  HR_BONUS_EDITABLE_PAYOUT_STATUSES,
  isHrBonusPayoutLocked,
} from "../../src/payroll-compensation/bonus-incentive-management/hr.payroll.bonus-lock.shared";

describe("HRM-BON-025 payout lock", () => {
  it("treats locked status or lockedAt as non-editable", () => {
    expect(
      isHrBonusPayoutLocked({ payoutStatus: "locked", lockedAt: null }),
    ).toBe(true);
    expect(
      isHrBonusPayoutLocked({
        payoutStatus: "approved",
        lockedAt: new Date("2026-01-01"),
      }),
    ).toBe(true);
    expect(
      isHrBonusPayoutLocked({ payoutStatus: "approved", lockedAt: null }),
    ).toBe(false);
  });

  it("allows draft, pending, approved, and returned before lock", () => {
    for (const status of HR_BONUS_EDITABLE_PAYOUT_STATUSES) {
      expect(isHrBonusPayoutLocked({ payoutStatus: status, lockedAt: null })).toBe(
        false,
      );
    }
  });
});
