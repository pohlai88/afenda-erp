import { describe, expect, it } from "vitest";

import {
  buildHrSbsBenchmarkReportCsv,
  buildHrSbsBenchmarkReportRows,
  filterHrSbsPayEquityReportRows,
} from "../data/hr.payroll.sbs-reports.shared";
import {
  deriveHrSbsBandReviewIndicator,
  deriveHrSbsMarketMovementIndicator,
} from "../data/hr.payroll.sbs-recommendations.server";

describe("hr.payroll.sbs reports", () => {
  it("filters benchmark report rows by market position", () => {
    const rows = buildHrSbsBenchmarkReportRows({
      employeeMetaById: {
        e1: { grade: "G5", jobFamily: "Eng" },
      },
      employeeResults: [
        {
          employeeId: "e1",
          currencyCode: "USD",
          baseSalaryComparison: {
            employeeAmount: 90_000,
            benchmarkAmount: 100_000,
            delta: -10_000,
            ratioPercent: 90,
            currencyCode: "USD",
          },
          totalCashComparison: null,
          totalCompComparison: null,
          compaRatio: 90,
          marketRatio: 90,
          marketPosition: "below_market",
          belowTarget: true,
          aboveRange: false,
        },
      ],
      filter: { marketPosition: "below_market" },
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.belowTarget).toBe(true);
  });

  it("exports benchmark report csv", () => {
    const csv = buildHrSbsBenchmarkReportCsv([
      {
        employeeId: "e1",
        jobFamily: "Eng",
        grade: "G5",
        departmentId: null,
        legalEntityCode: null,
        country: null,
        locationCode: null,
        marketPosition: "below_market",
        marketRatio: 90,
        compaRatio: 92,
        belowTarget: true,
        aboveRange: false,
      },
    ]);
    expect(csv).toContain("employeeId");
    expect(csv).toContain("e1");
  });

  it("filters pay equity rows to flagged cohorts", () => {
    const rows = filterHrSbsPayEquityReportRows(
      [
        {
          dimension: "grade",
          groupKey: "G5",
          employeeCount: 3,
          minSalary: 80_000,
          maxSalary: 120_000,
          medianSalary: 95_000,
          spreadPercent: 42,
          flagged: true,
        },
        {
          dimension: "grade",
          groupKey: "G6",
          employeeCount: 2,
          minSalary: 95_000,
          maxSalary: 100_000,
          medianSalary: 97_500,
          spreadPercent: 5,
          flagged: false,
        },
      ],
      { flaggedOnly: true },
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.groupKey).toBe("G5");
  });
});

describe("hr.payroll.sbs recommendations", () => {
  it("derives band review indicators from market ratio", () => {
    expect(
      deriveHrSbsBandReviewIndicator({
        marketRatio: 85,
        internalMidpoint: 100_000,
        benchmarkMidpoint: 110_000,
      }),
    ).toBe("expand_band");
  });

  it("derives market movement indicators", () => {
    expect(
      deriveHrSbsMarketMovementIndicator({
        priorMarketRatio: 95,
        currentMarketRatio: 102,
      }),
    ).toBe("rising");
  });
});
