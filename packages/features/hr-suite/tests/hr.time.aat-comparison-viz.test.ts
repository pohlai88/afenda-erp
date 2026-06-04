import { describe, expect, it } from "vitest";

import {
  AAT_COMPARISON_VIZ_REQUIREMENT_CODES,
  buildHeatmapCells,
  buildHeatmapVizConfig,
  buildPlannedVsUnplannedComparison,
  buildTrendMovementRows,
  buildWorkforceAvailabilityIndicators,
  computeAbsenceRatePct,
  computeTrendMovement,
  evaluateCoverageRisk,
  hrAatHeatmapQuerySchema,
  hrAatPlannedVsUnplannedQuerySchema,
  hrAatTrendMovementQuerySchema,
  isPlannedLeave,
  priorPeriodRange,
  rankDimensionTrendRows,
  type HrAatTrendMovementRow,
} from "../src/time-attendance/absence-analytics-trends/hr.time.aat-comparison.schema";
import { projectHeatmapFact } from "../src/time-attendance/absence-analytics-trends/hrs-hr-time-aat-heatmap-server";

describe("HRM-AAT-012 planned vs unplanned classification", () => {
  it("treats annual leave with notice as planned", () => {
    expect(
      isPlannedLeave({
        leaveType: "annual",
        submittedAt: new Date("2026-04-01T08:00:00.000Z"),
        startAt: new Date("2026-04-05T08:00:00.000Z"),
      }),
    ).toBe(true);
  });

  it("treats emergency leave as unplanned", () => {
    expect(
      isPlannedLeave({
        leaveType: "emergency",
        submittedAt: new Date("2026-04-01T08:00:00.000Z"),
        startAt: new Date("2026-04-05T08:00:00.000Z"),
      }),
    ).toBe(false);
  });

  it("builds comparable planned vs unplanned slices", () => {
    const comparison = buildPlannedVsUnplannedComparison({
      periodStart: new Date("2026-04-01T00:00:00.000Z"),
      periodEnd: new Date("2026-04-30T00:00:00.000Z"),
      plannedLostWorkdays: 12,
      plannedAbsenceCount: 4,
      unplannedLostWorkdays: 8,
      unplannedAbsenceCount: 3,
    });

    expect(comparison.requirementCode).toBe("HRM-AAT-012");
    expect(comparison.totalLostWorkdays).toBe(20);
    expect(comparison.plannedSharePct).toBe(60);
    expect(comparison.unplannedSharePct).toBe(40);
    expect(comparison.slices).toHaveLength(2);
  });
});

describe("HRM-AAT-013 dimension trend ranking", () => {
  it("ranks higher absence rates first", () => {
    const rows = rankDimensionTrendRows([
      {
        dimensionKey: "dept-a",
        dimensionLabel: "Dept A",
        absenceRatePct: 4,
        lostWorkdays: 2,
        absenceCount: 2,
        headcount: 10,
      },
      {
        dimensionKey: "dept-b",
        dimensionLabel: "Dept B",
        absenceRatePct: 12,
        lostWorkdays: 6,
        absenceCount: 4,
        headcount: 8,
      },
    ]);

    expect(rows[0]?.dimensionKey).toBe("dept-b");
    expect(rows[0]?.rank).toBe(1);
    expect(rows[1]?.rank).toBe(2);
  });

  it("computes absence rate against workforce capacity", () => {
    expect(
      computeAbsenceRatePct({
        absentDays: 2,
        lostLeaveDays: 3,
        headcount: 10,
        workingDaysInPeriod: 20,
      }),
    ).toBe(2.5);
  });
});

describe("HRM-AAT-014 workforce availability indicators", () => {
  it("derives availability counts and rate", () => {
    const indicators = buildWorkforceAvailabilityIndicators({
      periodStart: new Date("2026-04-01T00:00:00.000Z"),
      periodEnd: new Date("2026-04-30T00:00:00.000Z"),
      totalHeadcount: 20,
      onLeaveCount: 3,
      absentCount: 2,
    });

    expect(indicators.requirementCode).toBe("HRM-AAT-014");
    expect(indicators.availableCount).toBe(15);
    expect(indicators.unavailableCount).toBe(5);
    expect(indicators.availabilityRatePct).toBe(75);
  });
});

describe("HRM-AAT-015 workforce coverage risk", () => {
  it("flags at-risk coverage when threshold exceeded", () => {
    const flag = evaluateCoverageRisk({
      periodStart: new Date("2026-04-01T00:00:00.000Z"),
      periodEnd: new Date("2026-04-30T00:00:00.000Z"),
      totalHeadcount: 20,
      unavailableCount: 5,
      thresholdPct: 20,
    });

    expect(flag.requirementCode).toBe("HRM-AAT-015");
    expect(flag.isAtRisk).toBe(true);
    expect(flag.riskLevel).toBe("at_risk");
  });

  it("stays normal below threshold", () => {
    const flag = evaluateCoverageRisk({
      periodStart: new Date("2026-04-01T00:00:00.000Z"),
      periodEnd: new Date("2026-04-30T00:00:00.000Z"),
      totalHeadcount: 10,
      unavailableCount: 1,
      thresholdPct: 20,
    });

    expect(flag.isAtRisk).toBe(false);
    expect(flag.riskLevel).toBe("normal");
  });
});

describe("HRM-AAT-016 absence heatmap viz config", () => {
  it("parses heatmap query schema", () => {
    const parsed = hrAatHeatmapQuerySchema.parse({
      organizationId: "org_1",
      periodStart: "2026-04-01",
      periodEnd: "2026-04-30",
      rowAxis: "department",
    });

    expect(parsed.rowAxis).toBe("department");
  });

  it("builds serializable heatmap cells with intensity", () => {
    const cells = buildHeatmapCells([
      {
        rowKey: "dept-a",
        rowLabel: "Dept A",
        colKey: "2026-04-01",
        colLabel: "2026-04-01",
        value: 2,
      },
      {
        rowKey: "dept-a",
        rowLabel: "Dept A",
        colKey: "2026-04-02",
        colLabel: "2026-04-02",
        value: 4,
      },
    ]);

    expect(cells[1]?.intensity).toBe(1);
    expect(cells[0]?.intensity).toBe(0.5);
  });

  it("projects department rows against date columns", () => {
    const projected = projectHeatmapFact(
      {
        dateKey: "2026-04-03",
        teamKey: "mgr-1",
        teamLabel: "Manager 1",
        departmentKey: "dept-a",
        departmentLabel: "Dept A",
        locationKey: "hq",
        locationLabel: "HQ",
        leaveTypeKey: "annual",
        leaveTypeLabel: "annual",
        lostWorkdays: 1,
      },
      "department",
    );

    expect(projected.rowKey).toBe("dept-a");
    expect(projected.colKey).toBe("2026-04-03");
  });

  it("returns governed-surface-ready heatmap config", () => {
    const viz = buildHeatmapVizConfig({
      rowAxis: "location",
      periodStart: new Date("2026-04-01T00:00:00.000Z"),
      periodEnd: new Date("2026-04-30T00:00:00.000Z"),
      cells: buildHeatmapCells([
        {
          rowKey: "hq",
          rowLabel: "HQ",
          colKey: "2026-04-01",
          colLabel: "2026-04-01",
          value: 3,
        },
      ]),
    });

    expect(viz.rendererId).toBe("aat-absence-heatmap");
    expect(viz.maxValue).toBe(3);
    expect(viz.cells).toHaveLength(1);
  });
});

describe("HRM-AAT-017 trend movement indicators", () => {
  it("classifies improving, worsening, and stable movement", () => {
    expect(computeTrendMovement(8, 12, 2)).toBe("improving");
    expect(computeTrendMovement(12, 8, 2)).toBe("worsening");
    expect(computeTrendMovement(10, 9.5, 2)).toBe("stable");
  });

  it("builds prior period range from selected period", () => {
    const { priorPeriodStart, priorPeriodEnd } = priorPeriodRange(
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-30T00:00:00.000Z"),
    );

    expect(priorPeriodEnd < new Date("2026-04-01T00:00:00.000Z")).toBe(true);
    expect(priorPeriodStart < priorPeriodEnd).toBe(true);
  });

  it("returns serializable trend movement viz rows", () => {
    const viz = buildTrendMovementRows({
      dimension: "department",
      periodStart: new Date("2026-04-01T00:00:00.000Z"),
      periodEnd: new Date("2026-04-30T00:00:00.000Z"),
      priorPeriodStart: new Date("2026-03-01T00:00:00.000Z"),
      priorPeriodEnd: new Date("2026-03-31T00:00:00.000Z"),
      currentRates: new Map([
        ["dept-a", { label: "Dept A", ratePct: 10 }],
        ["dept-b", { label: "Dept B", ratePct: 4 }],
      ]),
      priorRates: new Map([
        ["dept-a", { label: "Dept A", ratePct: 14 }],
        ["dept-b", { label: "Dept B", ratePct: 4.5 }],
      ]),
    });

    expect(viz.rendererId).toBe("aat-trend-movement");
    const deptA = viz.rows.find(
      (row: HrAatTrendMovementRow) => row.dimensionKey === "dept-a",
    );
    const deptB = viz.rows.find(
      (row: HrAatTrendMovementRow) => row.dimensionKey === "dept-b",
    );
    expect(deptA?.movement).toBe("improving");
    expect(deptB?.movement).toBe("stable");
  });

  it("parses trend movement query schema", () => {
    const parsed = hrAatTrendMovementQuerySchema.parse({
      organizationId: "org_1",
      periodStart: "2026-04-01",
      periodEnd: "2026-04-30",
      dimension: "manager",
      stableThresholdPct: 2,
    });

    expect(parsed.dimension).toBe("manager");
  });
});

describe("AAT comparison viz requirement mapping", () => {
  it("covers HRM-AAT-012 through HRM-AAT-017", () => {
    expect(AAT_COMPARISON_VIZ_REQUIREMENT_CODES).toEqual([
      "HRM-AAT-012",
      "HRM-AAT-013",
      "HRM-AAT-014",
      "HRM-AAT-015",
      "HRM-AAT-016",
      "HRM-AAT-017",
    ]);
  });

  it("validates planned vs unplanned query tenancy input", () => {
    const parsed = hrAatPlannedVsUnplannedQuerySchema.parse({
      organizationId: "org_1",
      periodStart: "2026-04-01",
      periodEnd: "2026-04-30",
    });

    expect(parsed.organizationId).toBe("org_1");
  });
});
