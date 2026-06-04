import { describe, expect, it } from "vitest";

import {
  buildCompensationAnalysisSnapshot,
  classifyMarketPosition,
  compaRatio,
  compareBaseSalary,
  compareTotalCash,
  compareTotalComp,
  flagAboveRange,
  flagBelowTarget,
  HrSbsCalculationError,
  identifyPayGaps,
  marketRatio,
  payEquityAnalysis,
  resolveBenchmarkReferenceAmount,
} from "./hr.payroll.sbs-calculations.shared";

const benchmark = {
  currencyCode: "USD",
  minimum: 80_000,
  midpoint: 100_000,
  median: 98_000,
  maximum: 120_000,
  p25: 90_000,
  p50: 98_000,
  p75: 110_000,
  p90: 118_000,
};

const internalBand = { minimum: 85_000, midpoint: 100_000, maximum: 115_000 };

describe("hr.payroll.sbs-calculations.shared", () => {
  it("computes compa-ratio and market ratio", () => {
    expect(compaRatio(95_000, internalBand)).toBe(95);
    expect(marketRatio(95_000, benchmark)).toBe(95);
  });

  it("classifies market position from ratio thresholds", () => {
    expect(classifyMarketPosition(85)).toBe("below_market");
    expect(classifyMarketPosition(100)).toBe("at_market");
    expect(classifyMarketPosition(112)).toBe("above_market");
    expect(classifyMarketPosition(130)).toBe("outlier");
  });

  it("flags below target and above range employees", () => {
    expect(flagBelowTarget(90_000, benchmark)).toBe(true);
    expect(flagAboveRange(125_000, benchmark)).toBe(true);
    expect(flagBelowTarget(100_000, benchmark)).toBe(false);
  });

  it("compares base, total cash, and total comp", () => {
    const base = compareBaseSalary(95_000, benchmark, "USD");
    expect(base.ratioPercent).toBe(95);
    const cash = compareTotalCash(105_000, benchmark, "USD");
    expect(cash.ratioPercent).toBe(105);
    const total = compareTotalComp(110_000, benchmark, "USD");
    expect(total.ratioPercent).toBe(110);
  });

  it("throws on currency mismatch", () => {
    expect(() => compareBaseSalary(95_000, benchmark, "EUR")).toThrow(
      HrSbsCalculationError,
    );
  });

  it("throws when benchmark reference amount is missing", () => {
    expect(() =>
      resolveBenchmarkReferenceAmount({ currencyCode: "USD" }),
    ).toThrow(HrSbsCalculationError);
  });

  it("identifies pay gaps within peer groups", () => {
    const employees = [
      {
        employeeId: "e1",
        baseSalary: 80_000,
        currencyCode: "USD",
        grade: "G5",
      },
      {
        employeeId: "e2",
        baseSalary: 110_000,
        currencyCode: "USD",
        grade: "G5",
      },
    ];
    const gaps = identifyPayGaps(employees, { payGapSpreadPercent: 10 });
    expect(gaps.some((g) => g.dimension === "grade" && g.flagged)).toBe(true);
  });

  it("runs pay equity analysis by dimension", () => {
    const employees = [
      {
        employeeId: "e1",
        baseSalary: 80_000,
        currencyCode: "USD",
        jobFamily: "Engineering",
      },
      {
        employeeId: "e2",
        baseSalary: 120_000,
        currencyCode: "USD",
        jobFamily: "Engineering",
      },
    ];
    const equity = payEquityAnalysis(employees, { payEquityDisparityRatio: 1.2 });
    expect(
      equity.some((g) => g.dimension === "job_family" && g.flagged),
    ).toBe(true);
  });

  it("builds analysis snapshot with employee results", () => {
    const snapshot = buildCompensationAnalysisSnapshot({
      benchmarkVersionId: "v1",
      employees: [
        {
          employeeId: "e1",
          baseSalary: 95_000,
          totalCash: 100_000,
          totalComp: 105_000,
          currencyCode: "USD",
          grade: "G5",
          jobFamily: "Engineering",
        },
      ],
      internalBandsByGrade: { G5: internalBand },
      benchmarksByEmployeeId: { e1: benchmark },
    });

    expect(snapshot.analyzedEmployeeCount).toBe(1);
    expect(snapshot.employeeResults[0]?.marketRatio).toBe(95);
    expect(snapshot.flaggedBelowTargetCount).toBeGreaterThanOrEqual(0);
  });
});
