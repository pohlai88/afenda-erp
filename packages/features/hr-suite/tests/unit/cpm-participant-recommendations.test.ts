import { describe, expect, it } from "vitest";

import {
  buildCpmParticipantDisplayFields,
  buildCpmSalaryBandDisplayFields,
  formatCpmRangePosition,
  HR_CPM_MANAGER_ADJUSTMENT_TYPES,
  isHrCpmManagerAdjustmentType,
  resolveCpmAdjustmentIncreaseMode,
} from "../../src/payroll-compensation/compensation-planning-modeling/data/hr.payroll.cpm-participant-display.shared";
import {
  hrCpmEquityRecommendationSchema,
  hrCpmMarketRecommendationSchema,
  hrCpmMeritRecommendationSchema,
  hrCpmPromotionRecommendationSchema,
  hrCpmRetentionRecommendationSchema,
  mapHrCpmCreateRecommendationFormToMutation,
  parseHrCpmRecommendationInput,
} from "../../src/payroll-compensation/compensation-planning-modeling/schemas/hr.payroll.cpm-mutation.schema";
import { buildHrCpmRecommendationsListSurface } from "../../src/payroll-compensation/compensation-planning-modeling/surface/hr.payroll.cpm-lists.surface";
import { buildHrCpmParticipantContextStatGroups } from "../../src/payroll-compensation/compensation-planning-modeling/surface/hr.payroll.cpm-participant-context-stat.surface";

describe("HRM-CPM-006 participant display", () => {
  it("formats current compensation snapshot fields", () => {
    const fields = buildCpmParticipantDisplayFields({
      employeeLabel: "Alex Operator",
      currentSalary: 95_000,
      currentGrade: "G5",
      currentLevel: "L3",
      departmentName: "Engineering",
      managerLabel: "Jamie Manager",
      salaryEffectiveDate: new Date("2024-01-15T00:00:00.000Z"),
      currencyCode: "USD",
    });

    expect(fields.currentSalary).toBe("$95,000");
    expect(fields.currentGrade).toBe("G5");
    expect(fields.department).toBe("Engineering");
    expect(fields.manager).toBe("Jamie Manager");
    expect(fields.salaryEffectiveDate).toMatch(/Jan 15, 2024/);
  });

  it("builds governed participant context stat groups", () => {
    const groups = buildHrCpmParticipantContextStatGroups({
      participant: {
        employeeLabel: "Alex Operator",
        currentSalary: 95_000,
        currentGrade: "G5",
        currentLevel: "L3",
        departmentName: "Engineering",
        managerLabel: "Jamie Manager",
        salaryEffectiveDate: new Date("2024-01-15T00:00:00.000Z"),
      },
    });

    expect(groups).toHaveLength(1);
    expect(groups[0]?.groupKey).toBe("snapshot");
  });
});

describe("HRM-CPM-007 salary band display", () => {
  it("computes range position display from band and salary", () => {
    const fields = buildCpmSalaryBandDisplayFields({
      grade: "G5",
      minimum: 80_000,
      midpoint: 100_000,
      maximum: 120_000,
      currentSalary: 90_000,
      currencyCode: "USD",
    });

    expect(fields.configured).toBe(true);
    expect(fields.rangePosition).toBe(formatCpmRangePosition(25));
  });

  it("returns placeholders when band is not configured", () => {
    const fields = buildCpmSalaryBandDisplayFields(null);
    expect(fields.configured).toBe(false);
    expect(fields.bandMinimum).toBe("—");
  });
});

describe("HRM-CPM-008..012 recommendation schemas", () => {
  it("accepts merit increase by amount", () => {
    const parsed = parseHrCpmRecommendationInput({
      cycleId: "cycle_1",
      participantId: "part_1",
      employeeId: "emp_1",
      adjustmentType: "merit",
      currentSalary: 100_000,
      increaseAmount: 5_000,
    });

    expect(parsed.adjustmentType).toBe("merit");
    expect(hrCpmMeritRecommendationSchema.safeParse(parsed).success).toBe(true);
  });

  it("accepts promotion increase by percent", () => {
    const parsed = parseHrCpmRecommendationInput({
      cycleId: "cycle_1",
      participantId: "part_1",
      employeeId: "emp_1",
      adjustmentType: "promotion",
      currentSalary: 100_000,
      increasePercent: 12,
      proposedGrade: "G6",
    });

    expect(parsed.adjustmentType).toBe("promotion");
    expect(
      hrCpmPromotionRecommendationSchema.safeParse(parsed).success,
    ).toBe(true);
  });

  it("accepts market, equity, and retention adjustment types", () => {
    expect(
      hrCpmMarketRecommendationSchema.safeParse({
        cycleId: "cycle_1",
        participantId: "part_1",
        employeeId: "emp_1",
        adjustmentType: "market",
        currentSalary: 100_000,
        increasePercent: 8,
        marketReferencePercentile: 75,
      }).success,
    ).toBe(true);

    expect(
      hrCpmEquityRecommendationSchema.safeParse({
        cycleId: "cycle_1",
        participantId: "part_1",
        employeeId: "emp_1",
        adjustmentType: "equity",
        currentSalary: 100_000,
        increaseAmount: 4_000,
        equityGapReference: "peer cohort gap",
      }).success,
    ).toBe(true);

    expect(
      hrCpmRetentionRecommendationSchema.safeParse({
        cycleId: "cycle_1",
        participantId: "part_1",
        employeeId: "emp_1",
        adjustmentType: "retention",
        currentSalary: 100_000,
        increasePercent: 6,
        retentionRiskLevel: "high",
      }).success,
    ).toBe(true);
  });

  it("rejects both amount and percent increase inputs", () => {
    expect(
      hrCpmMeritRecommendationSchema.safeParse({
        cycleId: "cycle_1",
        participantId: "part_1",
        employeeId: "emp_1",
        adjustmentType: "merit",
        currentSalary: 100_000,
        increaseAmount: 5_000,
        increasePercent: 5,
      }).success,
    ).toBe(false);
  });

  it("maps create form payload to typed mutation input", () => {
    const mapped = mapHrCpmCreateRecommendationFormToMutation({
      cycleId: "cycle_1",
      participantId: "part_1",
      employeeId: "emp_1",
      adjustmentType: "retention",
      currentSalary: 100_000,
      increaseMode: "percent",
      increaseAmount: null,
      increasePercent: 7,
      retentionRiskLevel: "critical",
    });

    expect(mapped.adjustmentType).toBe("retention");
    expect(mapped.increasePercent).toBe(7);
    expect(resolveCpmAdjustmentIncreaseMode(mapped)).toBe("percent");
  });
});

describe("HRM-CPM manager adjustment types", () => {
  it("includes merit, promotion, market, equity, and retention", () => {
    expect(HR_CPM_MANAGER_ADJUSTMENT_TYPES).toEqual([
      "merit",
      "promotion",
      "market",
      "equity",
      "retention",
    ]);
    expect(isHrCpmManagerAdjustmentType("market")).toBe(true);
    expect(isHrCpmManagerAdjustmentType("special")).toBe(false);
  });
});

describe("hr payroll cpm recommendations list EUI contract", () => {
  it("exposes search toolbar and ERP permission for recommendations list", () => {
    const surface = buildHrCpmRecommendationsListSurface({
      window: {
        rows: [],
        pageSize: 25,
        totalCount: 0,
        hasNextPage: false,
      },
      canWrite: true,
      canApprove: false,
      searchValue: "merit",
    });

    expect(surface.presentation?.toolbar?.search?.param).toBe(
      "cpmRecommendationsSearch",
    );
    expect(surface.requiresErpPermission).toEqual({
      module: "hr",
      object: "cpm",
      function: "read",
    });
    expect(surface.dataNature).toBe("table");
  });
});
