import { describe, expect, it } from "vitest";

import {
  HrCompensationCalculationError,
  buildCompensationExceptionFlags,
  computeBudgetImpact,
  computeBudgetUtilization,
  computeCompensationScenario,
  computeProposedSalary,
  computeTotalCompImpact,
  evaluateCompensationEligibility,
  requiresJustification,
  validateBandPosition,
} from "../../src/payroll-compensation/compensation-planning-modeling/hr.payroll.cpm-calculations.shared";

const band = { minimum: 80_000, midpoint: 100_000, maximum: 120_000 };

describe("HRM-CPM-005 eligibility", () => {
  it("excludes employee when employment status does not match", () => {
    const result = evaluateCompensationEligibility(
      {
        employmentType: "full_time",
        employmentStatus: "terminated",
        tenureDays: 400,
        grade: "G5",
        level: "L3",
        departmentId: "dept_1",
        legalEntityCode: "US01",
        performanceRating: 4,
      },
      { employmentStatuses: ["active"] },
    );
    expect(result.eligible).toBe(false);
  });
});

describe("HRM-CPM-013 proposed salary (AC 9)", () => {
  it("calculates from increase amount", () => {
    expect(
      computeProposedSalary({ currentSalary: 100_000, increaseAmount: 5_000 }),
    ).toBe(105_000);
  });

  it("calculates from increase percent with two-decimal rounding", () => {
    expect(
      computeProposedSalary({ currentSalary: 100_000, increasePercent: 3.333 }),
    ).toBe(103_333);
  });

  it("prefers increase amount when both amount and percent are provided", () => {
    expect(
      computeProposedSalary({
        currentSalary: 100_000,
        increaseAmount: 2_000,
        increasePercent: 10,
      }),
    ).toBe(102_000);
  });

  it("returns unchanged salary when allowUnchanged is set", () => {
    expect(
      computeProposedSalary({ currentSalary: 100_000, allowUnchanged: true }),
    ).toBe(100_000);
  });

  it("throws when no increase input is provided", () => {
    expect(() => computeProposedSalary({ currentSalary: 100_000 })).toThrow(
      HrCompensationCalculationError,
    );
  });

  it("throws on invalid current salary", () => {
    expect(() =>
      computeProposedSalary({ currentSalary: -1, increaseAmount: 1_000 }),
    ).toThrow(HrCompensationCalculationError);
  });

  it("clamps proposed salary at zero for large negative increases", () => {
    expect(
      computeProposedSalary({ currentSalary: 50_000, increaseAmount: -60_000 }),
    ).toBe(0);
  });
});

describe("HRM-CPM-014 total comp impact", () => {
  it("sums base and reference components", () => {
    const result = computeTotalCompImpact({
      proposedSalary: 100_000,
      allowanceAmount: 2_000,
      bonusReferenceAmount: 5_000,
      benefitsReferenceAmount: 3_000,
      employerCostReferenceAmount: 1_000,
    });
    expect(result).toEqual({
      baseSalary: 100_000,
      allowances: 2_000,
      bonusReference: 5_000,
      benefitsReference: 3_000,
      employerCostReference: 1_000,
      totalCompensation: 111_000,
    });
  });

  it("throws on negative allowance reference", () => {
    expect(() =>
      computeTotalCompImpact({
        proposedSalary: 100_000,
        allowanceAmount: -100,
      }),
    ).toThrow(HrCompensationCalculationError);
  });
});

describe("HRM-CPM-015 what-if scenarios", () => {
  it("computes full scenario snapshot with band and budget context", () => {
    const result = computeCompensationScenario({
      currentSalary: 100_000,
      increasePercent: 10,
      allowanceAmount: 1_000,
      band,
      budgetAllocated: 20_000,
      existingBudgetImpacts: [5_000],
    });

    expect(result.proposedSalary).toBe(110_000);
    expect(result.budgetImpact).toBe(10_000);
    expect(result.bandValidation.bandFlag).toBe("within_band");
    expect(result.budgetUtilization).toMatchObject({
      allocated: 20_000,
      used: 15_000,
      remaining: 5_000,
      overBudget: false,
    });
    expect(result.justificationRequired).toBe(false);
  });

  it("flags over-budget and outside-band scenarios", () => {
    const result = computeCompensationScenario({
      currentSalary: 100_000,
      increaseAmount: 30_000,
      band,
      budgetAllocated: 10_000,
      existingBudgetImpacts: [8_000],
    });

    expect(result.bandValidation.bandFlag).toBe("above_maximum");
    expect(result.overBudget).toBe(true);
    expect(result.exceptionFlags).toEqual([
      "over_budget",
      "above_band_maximum",
    ]);
    expect(result.justificationRequired).toBe(true);
  });
});

describe("HRM-CPM-016/017 band validation (AC 12)", () => {
  it("flags below minimum", () => {
    const result = validateBandPosition(75_000, band);
    expect(result.bandFlag).toBe("below_minimum");
    expect(result.status).toBe("below_min");
  });

  it("flags above maximum", () => {
    const result = validateBandPosition(125_000, band);
    expect(result.bandFlag).toBe("above_maximum");
    expect(result.status).toBe("above_max");
  });

  it("computes range position and compa-ratio within band", () => {
    const result = validateBandPosition(100_000, band);
    expect(result.bandFlag).toBe("within_band");
    expect(result.rangePosition).toBe(50);
    expect(result.compaRatio).toBe(100);
  });

  it("returns no_band when band is absent", () => {
    expect(validateBandPosition(100_000, null).status).toBe("no_band");
  });

  it("throws on invalid band configuration", () => {
    expect(() =>
      validateBandPosition(100_000, {
        minimum: 120_000,
        midpoint: 100_000,
        maximum: 80_000,
      }),
    ).toThrow(HrCompensationCalculationError);
  });
});

describe("HRM-CPM-018/019 budget utilization (AC 10, AC 11)", () => {
  it("calculates utilization and remaining budget", () => {
    const result = computeBudgetUtilization(50_000, [10_000, 15_000]);
    expect(result).toMatchObject({
      allocated: 50_000,
      used: 25_000,
      remaining: 25_000,
      utilizationPercent: 50,
      overBudget: false,
    });
  });

  it("flags over budget when cumulative impact exceeds allocation", () => {
    const result = computeBudgetUtilization(10_000, [4_000, 7_000]);
    expect(result.overBudget).toBe(true);
    expect(result.used).toBe(11_000);
    expect(result.remaining).toBe(-1_000);
  });

  it("throws on non-finite budget impact", () => {
    expect(() => computeBudgetUtilization(10_000, [5_000, NaN])).toThrow(
      HrCompensationCalculationError,
    );
  });

  it("throws on negative allocated budget", () => {
    expect(() => computeBudgetUtilization(-1, [1_000])).toThrow(
      HrCompensationCalculationError,
    );
  });
});

describe("HRM-CPM-020 justification (AC 13)", () => {
  it("requires justification for over-budget recommendations", () => {
    expect(requiresJustification({ overBudget: true })).toBe(true);
  });

  it("requires justification for below-band recommendations", () => {
    expect(requiresJustification({ bandFlag: "below_minimum" })).toBe(true);
  });

  it("requires justification for above-band recommendations", () => {
    expect(requiresJustification({ bandFlag: "above_maximum" })).toBe(true);
  });

  it("requires justification for special adjustments", () => {
    expect(requiresJustification({ adjustmentType: "special" })).toBe(true);
  });

  it("does not require justification for in-band within-budget merit increases", () => {
    expect(
      requiresJustification({
        overBudget: false,
        bandFlag: "within_band",
        adjustmentType: "merit",
      }),
    ).toBe(false);
  });
});

describe("HRM-CPM budget impact", () => {
  it("computes salary delta", () => {
    expect(computeBudgetImpact(100_000, 108_000)).toBe(8_000);
  });

  it("returns zero when proposed salary is lower than current", () => {
    expect(computeBudgetImpact(100_000, 95_000)).toBe(0);
  });
});

describe("buildCompensationExceptionFlags", () => {
  it("collects over-budget and band exception flags", () => {
    expect(
      buildCompensationExceptionFlags({
        overBudget: true,
        bandFlag: "below_minimum",
      }),
    ).toEqual(["over_budget", "below_band_minimum"]);
  });
});
