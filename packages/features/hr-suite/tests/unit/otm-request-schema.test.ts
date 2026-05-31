import { describe, expect, it } from "vitest";

import {
  HRM_OTM_DAY_CATEGORIES,
  HRM_OTM_TIMING_KINDS,
  resolveOtmEligibilityForSubmit,
} from "@afenda/db";

import {
  applyOtmOnBehalfFormSchema,
  requestOwnOtmFormSchema,
  resolveOtmSubmitHours,
} from "../../src/time-attendance/overtime-management/schemas/hr.time.otm-request.schema";
import { HR_OTM_DAY_CATEGORY_LABELS } from "../../src/time-attendance/overtime-management/data/hr.time.otm-catalog.shared";

describe("OTM catalog (HRM-OTM-003, HRM-OTM-006)", () => {
  it("exposes planned and actual timing kinds", () => {
    expect(HRM_OTM_TIMING_KINDS).toEqual(["planned", "actual"]);
  });

  it("exposes enterprise day categories including normal, rest, off, holiday, night, emergency", () => {
    expect(HRM_OTM_DAY_CATEGORIES).toEqual(
      expect.arrayContaining([
        "regular",
        "rest_day",
        "off_day",
        "public_holiday",
        "night",
        "emergency",
      ]),
    );
    expect(HR_OTM_DAY_CATEGORY_LABELS.regular).toBe("Normal day");
    expect(HR_OTM_DAY_CATEGORY_LABELS.night).toBe("Night overtime");
    expect(HR_OTM_DAY_CATEGORY_LABELS.emergency).toBe("Emergency overtime");
  });
});

describe("OTM submit schema (HRM-OTM-002)", () => {
  it("accepts date, time range, type, timing, and reason", () => {
    const parsed = requestOwnOtmFormSchema.safeParse({
      workDate: "2026-06-01",
      startTime: "18:00",
      endTime: "20:30",
      overtimeType: "regular",
      timingKind: "actual",
      reason: "Month-end close support",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.timingKind).toBe("actual");
      expect(parsed.data.overtimeType).toBe("regular");
    }
  });

  it("accepts explicit hours instead of time range", () => {
    const parsed = requestOwnOtmFormSchema.safeParse({
      workDate: "2026-06-01",
      hours: 2.5,
      overtimeType: "public_holiday",
      timingKind: "planned",
      reason: "Planned holiday coverage",
    });

    expect(parsed.success).toBe(true);
  });

  it("requires employee reference for on-behalf submit (HRM-OTM-001)", () => {
    const missingEmployee = applyOtmOnBehalfFormSchema.safeParse({
      workDate: "2026-06-01",
      hours: 1,
      overtimeType: "regular",
      reason: "Coverage",
    });
    expect(missingEmployee.success).toBe(false);

    const withEmployee = applyOtmOnBehalfFormSchema.safeParse({
      employeeId: "emp-1",
      workDate: "2026-06-01",
      hours: 1,
      overtimeType: "regular",
      reason: "Coverage",
    });
    expect(withEmployee.success).toBe(true);
  });

  it("derives hours from start/end when hours omitted", () => {
    expect(
      resolveOtmSubmitHours({ startTime: "22:00", endTime: "02:00" }),
    ).toBe(4);
  });
});

describe("OTM eligibility override (HRM-OTM-005)", () => {
  it("blocks ineligible submit without override reason", () => {
    const result = resolveOtmEligibilityForSubmit({
      result: {
        eligible: false,
        requiresExceptionApproval: true,
        matchedRuleId: "rule-1",
        reason: "Employee matched an ineligible rule",
      },
    });

    expect(result.eligible).toBe(false);
  });

  it("allows authorized override when exception reason is supplied", () => {
    const result = resolveOtmEligibilityForSubmit({
      result: {
        eligible: false,
        requiresExceptionApproval: true,
        matchedRuleId: "rule-1",
        reason: "Employee matched an ineligible rule",
      },
      eligibilityExceptionReason: "HR approved exception for project go-live",
    });

    expect(result.eligible).toBe(true);
    expect(result.reason).toBe("Authorized eligibility override");
  });
});
