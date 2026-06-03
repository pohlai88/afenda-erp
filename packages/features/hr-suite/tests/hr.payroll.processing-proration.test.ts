import { describe, expect, it } from "vitest";

import { calculateHrPayrollProration } from "../data/hr.payroll.processing-proration.shared";

const periodStart = new Date("2026-05-01T00:00:00.000Z");
const periodEnd = new Date("2026-05-31T00:00:00.000Z");

describe("HRM-PAY-014 proration", () => {
  it("prorates new joiner from join date", () => {
    const result = calculateHrPayrollProration({
      reason: "new_joiner",
      periodAmount: 5000,
      periodStart,
      periodEnd,
      eventDate: new Date("2026-05-16T00:00:00.000Z"),
    });

    expect(result.proratedAmount).toBeGreaterThan(0);
    expect(result.proratedAmount).toBeLessThan(5000);
    expect(result.factor).toBeGreaterThan(0);
    expect(result.factor).toBeLessThan(1);
  });

  it("prorates resignation through last working day", () => {
    const result = calculateHrPayrollProration({
      reason: "resignation",
      periodAmount: 5000,
      periodStart,
      periodEnd,
      eventDate: new Date("2026-05-15T00:00:00.000Z"),
    });

    expect(result.proratedAmount).toBeGreaterThan(0);
    expect(result.proratedAmount).toBeLessThan(5000);
  });

  it("deducts unpaid leave days", () => {
    const result = calculateHrPayrollProration({
      reason: "unpaid_leave",
      periodAmount: 5000,
      periodStart,
      periodEnd,
      unpaidDays: 5,
    });

    expect(result.proratedAmount).toBeLessThan(5000);
  });

  it("handles mid-period salary change with two segments", () => {
    const result = calculateHrPayrollProration({
      reason: "mid_period_salary_change",
      periodAmount: 5000,
      priorPeriodAmount: 4000,
      newPeriodAmount: 6000,
      periodStart,
      periodEnd,
      salaryChangeDate: new Date("2026-05-16T00:00:00.000Z"),
    });

    expect(result.proratedAmount).toBeGreaterThan(4000);
    expect(result.proratedAmount).toBeLessThan(6000);
  });
});
