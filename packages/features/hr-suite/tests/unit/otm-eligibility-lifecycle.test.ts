import { describe, expect, it } from "vitest";

import {
  canTransitionOtmStatus,
  computeOtmDurationMinutesFromTimeRange,
  formatOtmDurationMinutes,
  formatOtmStatusLabel,
  HRM_OTM_DAY_CATEGORIES,
  HRM_OTM_TIMING_KINDS,
  otmMatchesEligibilityRule,
  otmRuleSpecificityScore,
  resolveOtmEligibilityFromRules,
  type HrOvertimeEligibilityRuleRow,
} from "@afenda/db";

import { listHrTimeOtmVisibleStatusOptions as featureStatusOptions } from "../../src/time-attendance/overtime-management/hr.time.otm-lifecycle.shared";

const baseRule = (
  overrides: Partial<HrOvertimeEligibilityRuleRow> = {},
): HrOvertimeEligibilityRuleRow => ({
  id: "rule-1",
  policyGroupCode: "default",
  overtimeType: "regular",
  legalEntityCode: null,
  countryCode: null,
  workLocationCode: null,
  departmentId: null,
  roleCode: null,
  grade: null,
  employmentType: null,
  employeeCategory: null,
  eligible: true,
  requiresExceptionApproval: false,
  effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  effectiveTo: null,
  ...overrides,
});

describe("OTM eligibility matrix (HRM-OTM-004)", () => {
  it("exports timing and day category catalogs for submit surfaces", () => {
    expect(HRM_OTM_TIMING_KINDS).toContain("planned");
    expect(HRM_OTM_TIMING_KINDS).toContain("actual");
    expect(HRM_OTM_DAY_CATEGORIES).toContain("regular");
    expect(HRM_OTM_DAY_CATEGORIES).toContain("emergency");
  });

  it("prefers legal entity + location scoped rules over generic rules", () => {
    const generic = baseRule({ id: "generic" });
    const scoped = baseRule({
      id: "scoped",
      legalEntityCode: "MY-LE",
      workLocationCode: "KL-HQ",
    });

    expect(otmRuleSpecificityScore(scoped)).toBeGreaterThan(
      otmRuleSpecificityScore(generic),
    );

    const result = resolveOtmEligibilityFromRules({
      rules: [generic, scoped],
      context: {
        overtimeType: "regular",
        legalEntityCode: "MY-LE",
        countryCode: "MY",
        workLocationCode: "KL-HQ",
        departmentId: "dept-1",
        roleCode: null,
        grade: "G5",
        employmentType: "permanent",
        employeeCategory: "staff",
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      },
    });

    expect(result.eligible).toBe(true);
    expect(result.matchedRuleId).toBe("scoped");
  });

  it("matches policy group dimensions including department and grade", () => {
    const rule = baseRule({
      departmentId: "dept-1",
      grade: "G5",
      employmentType: "permanent",
    });

    expect(
      otmMatchesEligibilityRule(rule, {
        overtimeType: "regular",
        legalEntityCode: null,
        countryCode: null,
        workLocationCode: null,
        departmentId: "dept-1",
        roleCode: null,
        grade: "G5",
        employmentType: "permanent",
        employeeCategory: null,
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      }),
    ).toBe(true);
  });
});

describe("OTM status lifecycle (HRM-OTM-025)", () => {
  it("exposes readable labels for all lifecycle states", () => {
    expect(formatOtmStatusLabel("draft")).toBe("Draft");
    expect(formatOtmStatusLabel("submitted")).toBe("Pending approval");
    expect(formatOtmStatusLabel("payroll_ready")).toBe("Payroll ready");
    expect(formatOtmStatusLabel("paid")).toBe("Paid");
  });

  it("allows draft → submitted → approved → payroll_ready → paid", () => {
    expect(canTransitionOtmStatus("draft", "submitted")).toBe(true);
    expect(canTransitionOtmStatus("submitted", "approved")).toBe(true);
    expect(canTransitionOtmStatus("approved", "payroll_ready")).toBe(true);
    expect(canTransitionOtmStatus("payroll_ready", "paid")).toBe(true);
  });

  it("blocks illegal transitions such as draft → paid", () => {
    expect(canTransitionOtmStatus("draft", "paid")).toBe(false);
    expect(canTransitionOtmStatus("paid", "submitted")).toBe(false);
  });

  it("blocks skipping payroll_ready before paid", () => {
    expect(canTransitionOtmStatus("approved", "paid")).toBe(false);
  });

  it("exposes full lifecycle options via feature door (AC 22)", () => {
    const options = featureStatusOptions();
    expect(options.length).toBeGreaterThanOrEqual(8);
    expect(options.map((o) => o.value)).toContain("payroll_ready");
    expect(options.find((o) => o.value === "draft")?.label).toBe("Draft");
  });

  it("maps rejected and returned lifecycle labels", () => {
    expect(formatOtmStatusLabel("rejected")).toBe("Rejected");
    expect(formatOtmStatusLabel("returned")).toBe("Returned");
    expect(formatOtmStatusLabel("cancelled")).toBe("Cancelled");
  });
});

describe("OTM duration display", () => {
  it("computes minutes across midnight boundary", () => {
    expect(
      computeOtmDurationMinutesFromTimeRange({
        startTime: "22:00",
        endTime: "02:00",
      }),
    ).toBe(240);
  });

  it("formats payable duration", () => {
    expect(formatOtmDurationMinutes(90)).toBe("1h 30m");
    expect(formatOtmDurationMinutes(120)).toBe("2h");
  });
});
