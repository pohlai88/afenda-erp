import { describe, expect, it } from "vitest";

import {
  applyBonusAccelerator,
  applyBonusCommissionTiers,
  calculateBonusPayout,
  computeBonusAchievementPercent,
  enforceBonusPayoutBounds,
} from "./hr.payroll.bonus-calculation.shared";
import {
  recordBonusTargetAchievementSchema,
  upsertBonusPayoutFormulaSchema,
} from "../schemas/hr.payroll.bonus-mutation.schema";

describe("HRM-BON-008 achievement percentage", () => {
  it("computes percentage against target", () => {
    expect(computeBonusAchievementPercent(100, 80)).toBe(80);
    expect(computeBonusAchievementPercent(100, 120)).toBe(120);
  });

  it("returns 100 when both target and actual are zero", () => {
    expect(computeBonusAchievementPercent(0, 0)).toBe(100);
  });

  it("returns null when target is zero but actual is non-zero", () => {
    expect(computeBonusAchievementPercent(0, 50)).toBeNull();
  });
});

describe("HRM-BON-009 payout formulas", () => {
  it("calculates fixed amount payout", () => {
    const result = calculateBonusPayout({
      formulaKind: "fixed_amount",
      fixedAmount: 5000,
    });
    expect(result.finalPayout).toBe(5000);
  });

  it("calculates salary percentage payout", () => {
    const result = calculateBonusPayout({
      formulaKind: "salary_percentage",
      percentageRate: 10,
      baseSalary: 80000,
    });
    expect(result.finalPayout).toBe(8000);
  });

  it("calculates sales percentage payout", () => {
    const result = calculateBonusPayout({
      formulaKind: "sales_percentage",
      percentageRate: 5,
      salesAmount: 200000,
    });
    expect(result.finalPayout).toBe(10000);
  });

  it("calculates performance rating payout", () => {
    const result = calculateBonusPayout({
      formulaKind: "performance_rating",
      performanceRating: 4,
      performanceRatingWeight: 2500,
    });
    expect(result.finalPayout).toBe(10000);
  });

  it("validates formula schema requirements", () => {
    const invalid = upsertBonusPayoutFormulaSchema.safeParse({
      planId: "hr_bon_plan_1",
      formulaKind: "fixed_amount",
    });
    expect(invalid.success).toBe(false);
  });
});

describe("HRM-BON-010 tiered commission", () => {
  const tiers = [
    { minThreshold: 0, maxThreshold: 100000, ratePercent: 5 },
    { minThreshold: 100000, maxThreshold: null, ratePercent: 8 },
  ] as const;

  it("applies first tier rate", () => {
    const tiered = applyBonusCommissionTiers(80000, tiers);
    expect(tiered.payout).toBe(4000);
    expect(tiered.tierIndex).toBe(0);
  });

  it("applies upper tier rate", () => {
    const tiered = applyBonusCommissionTiers(150000, tiers);
    expect(tiered.payout).toBe(12000);
    expect(tiered.tierIndex).toBe(1);
  });

  it("integrates tiers into full payout pipeline", () => {
    const result = calculateBonusPayout({
      formulaKind: "sales_percentage",
      percentageRate: 5,
      salesAmount: 150000,
      tiers,
    });
    expect(result.tieredPayout).toBe(12000);
    expect(result.finalPayout).toBe(12000);
  });
});

describe("HRM-BON-011 accelerator", () => {
  it("does not apply below threshold", () => {
    const accelerated = applyBonusAccelerator(10000, 95, {
      thresholdPercent: 100,
      acceleratorRate: 0.5,
    });
    expect(accelerated.applied).toBe(false);
    expect(accelerated.payout).toBe(10000);
  });

  it("applies accelerator for overachievement", () => {
    const accelerated = applyBonusAccelerator(10000, 120, {
      thresholdPercent: 100,
      acceleratorRate: 0.5,
    });
    expect(accelerated.applied).toBe(true);
    expect(accelerated.payout).toBe(11000);
  });

  it("integrates accelerator into full payout pipeline", () => {
    const result = calculateBonusPayout({
      formulaKind: "fixed_amount",
      fixedAmount: 10000,
      achievementPercent: 120,
      accelerator: { thresholdPercent: 100, acceleratorRate: 0.5 },
    });
    expect(result.acceleratorApplied).toBe(true);
    expect(result.finalPayout).toBe(11000);
  });
});

describe("HRM-BON-012 payout cap and floor", () => {
  it("enforces floor", () => {
    const bounded = enforceBonusPayoutBounds(500, {
      payoutFloor: 1000,
      payoutCap: null,
    });
    expect(bounded.floored).toBe(true);
    expect(bounded.payout).toBe(1000);
  });

  it("enforces cap", () => {
    const bounded = enforceBonusPayoutBounds(15000, {
      payoutFloor: null,
      payoutCap: 12000,
    });
    expect(bounded.capped).toBe(true);
    expect(bounded.payout).toBe(12000);
  });

  it("integrates bounds into full payout pipeline", () => {
    const result = calculateBonusPayout({
      formulaKind: "salary_percentage",
      percentageRate: 20,
      baseSalary: 100000,
      bounds: { payoutFloor: 5000, payoutCap: 15000 },
    });
    expect(result.finalPayout).toBe(15000);
    expect(result.capped).toBe(true);
  });
});

describe("HRM-BON-007 achievement capture schema", () => {
  it("accepts valid achievement input", () => {
    const parsed = recordBonusTargetAchievementSchema.safeParse({
      targetId: "hr_bon_tgt_1",
      actualValue: "85000",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects negative actual values", () => {
    const parsed = recordBonusTargetAchievementSchema.safeParse({
      targetId: "hr_bon_tgt_1",
      actualValue: "-1",
    });
    expect(parsed.success).toBe(false);
  });
});
