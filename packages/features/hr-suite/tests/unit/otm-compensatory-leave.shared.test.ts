import { describe, expect, it } from "vitest";

import {
  HRM_OTM_MINUTES_PER_LEAVE_DAY,
  otmPayableMinutesToCompensatoryLeaveDays,
} from "../../src/time-attendance/overtime-management/hr.time.otm-compensatory-leave.shared";

describe("OTM compensatory leave conversion (HRM-OTM-022)", () => {
  it("converts 480 payable minutes to one leave day", () => {
    expect(
      otmPayableMinutesToCompensatoryLeaveDays(HRM_OTM_MINUTES_PER_LEAVE_DAY),
    ).toBe(1);
  });

  it("converts partial minutes proportionally", () => {
    expect(otmPayableMinutesToCompensatoryLeaveDays(240)).toBe(0.5);
    expect(otmPayableMinutesToCompensatoryLeaveDays(90)).toBe(0.1875);
  });

  it("returns zero for non-positive minutes", () => {
    expect(otmPayableMinutesToCompensatoryLeaveDays(0)).toBe(0);
    expect(otmPayableMinutesToCompensatoryLeaveDays(-30)).toBe(0);
  });
});
