import { describe, expect, it } from "vitest";

import {
  applyOtmCaps,
  applyOtmRounding,
  buildOtmCalculationSnapshot,
  calculateOtmPayableForApproval,
  computeOtmAmountCents,
  DEFAULT_HR_OVERTIME_POLICY,
  detectOtmAttendanceMismatch,
  detectOtmShiftVariance,
  enforceOtmMinDuration,
  resolveOtmEarningCode,
  resolveOtmPayMultiplier,
  resolveOtmRateMultiplier,
  resolveOtmRequestedMinutes,
  roundOtmPayableMinutes,
  type HrOvertimeRateRuleRow,
} from "../../../../db/src/hr-otm-calculation.shared";

const baseRateRule = (
  overrides: Partial<HrOvertimeRateRuleRow> = {},
): HrOvertimeRateRuleRow => ({
  id: "rate-1",
  policyGroupCode: "default",
  name: "MY public holiday",
  overtimeType: "public_holiday",
  dayCategory: "public_holiday",
  shiftCategory: null,
  employeeCategory: null,
  countryCode: "MY",
  multiplier: "3.00",
  earningCode: "OT_PH",
  priority: 0,
  effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  effectiveTo: null,
  ...overrides,
});

describe("OTM calculation (HRM-OTM-021)", () => {
  it("rounds payable minutes to the nearest interval", () => {
    expect(roundOtmPayableMinutes(92, 15)).toBe(90);
    expect(roundOtmPayableMinutes(98, 15)).toBe(105);
  });

  it("resolves statutory multipliers by overtime type", () => {
    expect(resolveOtmPayMultiplier("regular")).toBe(1.5);
    expect(resolveOtmPayMultiplier("public_holiday")).toBe(3);
  });

  it("computes amount cents from minutes, hourly rate, and multiplier", () => {
    expect(
      computeOtmAmountCents({
        payableMinutes: 120,
        hourlyRateCents: 2_000,
        multiplier: 1.5,
      }),
    ).toBe(6_000);
  });

  it("builds a calculation snapshot with earning code and amount", () => {
    const snapshot = buildOtmCalculationSnapshot({
      rawMinutes: 125,
      overtimeType: "weekend",
      hourlyRateCents: 2_500,
      roundingIntervalMinutes: 15,
    });

    expect(snapshot.payableMinutes).toBe(120);
    expect(snapshot.payMultiplier).toBe(2);
    expect(snapshot.earningCode).toBe(resolveOtmEarningCode("weekend"));
    expect(snapshot.amountCents).toBe(
      computeOtmAmountCents({
        payableMinutes: snapshot.payableMinutes,
        hourlyRateCents: snapshot.hourlyRateCents,
        multiplier: snapshot.payMultiplier,
      }),
    );
  });
});

describe("HRM-OTM-007 rate multipliers (AC 6)", () => {
  it("prefers country-scoped rate rule over type default", () => {
    const generic = baseRateRule({
      id: "generic",
      countryCode: null,
      multiplier: "2.00",
    });
    const scoped = baseRateRule({
      id: "scoped",
      countryCode: "MY",
      multiplier: "3.00",
    });

    const result = resolveOtmRateMultiplier({
      rules: [generic, scoped],
      context: {
        overtimeType: "public_holiday",
        dayCategory: "public_holiday",
        shiftCategory: null,
        employeeCategory: null,
        countryCode: "MY",
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      },
    });

    expect(result.rateRuleId).toBe("scoped");
    expect(result.multiplier).toBe(3);
    expect(result.earningCode).toBe("OT_PH");
  });
});

describe("HRM-OTM-008 hours from time range or attendance (AC 7)", () => {
  it("derives minutes from HH:mm range", () => {
    expect(
      resolveOtmRequestedMinutes({ startTime: "18:00", endTime: "20:30" }),
    ).toBe(150);
  });

  it("uses attendance minutes when compare is enabled", () => {
    const result = calculateOtmPayableForApproval({
      policy: {
        ...DEFAULT_HR_OVERTIME_POLICY,
        compareAttendanceEnabled: true,
      },
      rateRules: [],
      rateContext: {
        overtimeType: "regular",
        dayCategory: "weekday",
        shiftCategory: null,
        employeeCategory: null,
        countryCode: null,
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      },
      periodUsage: { dailyMinutes: 0, weeklyMinutes: 0, monthlyMinutes: 0 },
      startTime: "18:00",
      endTime: "21:00",
      attendanceOvertimeMinutes: 120,
    });

    expect(result.requestedMinutes).toBe(180);
    expect(result.sourceMinutes).toBe(120);
    expect(result.attendanceMinutes).toBe(120);
  });
});

describe("HRM-OTM-009 shift variance (AC 8)", () => {
  it("flags overtime extending beyond scheduled shift end", () => {
    const exception = detectOtmShiftVariance({
      requestStartTime: "17:00",
      requestEndTime: "22:00",
      scheduledShift: {
        shiftStartTime: "09:00",
        shiftEndTime: "18:00",
        workingMinutes: 480,
      },
      toleranceMinutes: 15,
    });

    expect(exception?.kind).toBe("shift_variance");
  });
});

describe("HRM-OTM-010 attendance reconcile (AC 9)", () => {
  it("flags attendance mismatch above tolerance", () => {
    const exception = detectOtmAttendanceMismatch({
      compareAttendanceEnabled: true,
      requestedMinutes: 180,
      attendanceMinutes: 120,
      toleranceMinutes: 15,
    });

    expect(exception?.kind).toBe("attendance_mismatch");
  });
});

describe("HRM-OTM-011 rounding (AC 10)", () => {
  it("rounds down to interval", () => {
    expect(
      applyOtmRounding(92, {
        roundingMode: "down",
        roundingIntervalMinutes: 15,
        graceMinutesBeforeRounding: 0,
      }),
    ).toBe(90);
  });

  it("rounds up to interval", () => {
    expect(
      applyOtmRounding(92, {
        roundingMode: "up",
        roundingIntervalMinutes: 15,
        graceMinutesBeforeRounding: 0,
      }),
    ).toBe(105);
  });
});

describe("HRM-OTM-012 minimum duration (AC 10)", () => {
  it("creates min_duration exception below policy threshold", () => {
    const exception = enforceOtmMinDuration({
      minutes: 30,
      minOvertimeMinutes: 60,
    });

    expect(exception?.kind).toBe("min_duration");
  });
});

describe("HRM-OTM-013 caps (AC 11)", () => {
  it("caps payable minutes and flags daily_cap exception", () => {
    const { cappedMinutes, exceptions } = applyOtmCaps({
      minutes: 120,
      policy: {
        dailyCapMinutes: 180,
        weeklyCapMinutes: null,
        monthlyCapMinutes: null,
        statutoryCapMinutes: null,
        budgetCapMinutes: null,
      },
      periodUsage: { dailyMinutes: 90, weeklyMinutes: 90, monthlyMinutes: 90 },
    });

    expect(cappedMinutes).toBe(90);
    expect(exceptions.some((e) => e.kind === "daily_cap")).toBe(true);
  });
});

describe("HRM-OTM-014 exceeded limits flagged (AC 12)", () => {
  it("returns multiple exception kinds from full calculation", () => {
    const result = calculateOtmPayableForApproval({
      policy: {
        ...DEFAULT_HR_OVERTIME_POLICY,
        compareAttendanceEnabled: true,
        minOvertimeMinutes: 120,
        dailyCapMinutes: 120,
        shiftVarianceToleranceMinutes: 0,
        attendanceVarianceToleranceMinutes: 0,
      },
      rateRules: [],
      rateContext: {
        overtimeType: "regular",
        dayCategory: "weekday",
        shiftCategory: null,
        employeeCategory: null,
        countryCode: null,
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      },
      periodUsage: { dailyMinutes: 100, weeklyMinutes: 100, monthlyMinutes: 100 },
      startTime: "18:00",
      endTime: "18:30",
      attendanceOvertimeMinutes: 90,
      scheduledShift: {
        shiftStartTime: "09:00",
        shiftEndTime: "18:00",
        workingMinutes: 480,
      },
    });

    const kinds = result.exceptions.map((e) => e.kind);
    expect(kinds).toContain("shift_variance");
    expect(kinds).toContain("attendance_mismatch");
    expect(kinds).toContain("min_duration");
    expect(kinds).toContain("daily_cap");
  });
});
