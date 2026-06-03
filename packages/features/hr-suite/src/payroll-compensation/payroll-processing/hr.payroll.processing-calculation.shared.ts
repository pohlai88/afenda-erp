import {
  computeDailyWageAmount,
  computeFixedComponentAmount,
  computeHourlyWageAmount,
  computeOvertimeAmount,
  computePercentageAmount,
  computeProratedAmount,
} from "@afenda/db";

export {
  computeFixedComponentAmount,
  computeHourlyWageAmount,
  computeDailyWageAmount,
  computeOvertimeAmount,
  computePercentageAmount,
  computeProratedAmount,
};

/** HRM-PAY-004..011 — feature-layer calculation helpers. */
export function calculateHrPayrollBasicEarnings(input: {
  salaryType: "monthly" | "hourly" | "daily";
  amount: number;
  hours?: number;
  days?: number;
}) {
  switch (input.salaryType) {
    case "hourly":
      return computeHourlyWageAmount(input.hours ?? 0, input.amount);
    case "daily":
      return computeDailyWageAmount(input.days ?? 0, input.amount);
    default:
      return computeFixedComponentAmount(input.amount);
  }
}

export function calculateHrPayrollOvertimeEarning(input: {
  hours: number;
  baseRate: number;
  multiplier?: number;
}) {
  return computeOvertimeAmount(
    input.hours,
    input.baseRate,
    input.multiplier ?? 1.5,
  );
}

export function calculateHrPayrollStatutoryDeduction(input: {
  baseAmount: number;
  ratePercent: number;
}) {
  return computePercentageAmount(input.baseAmount, input.ratePercent);
}
