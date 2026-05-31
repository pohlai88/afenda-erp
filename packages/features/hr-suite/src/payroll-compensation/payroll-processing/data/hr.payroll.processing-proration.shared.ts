import {
  HR_PAYROLL_DEFAULT_WORKING_DAYS_PER_MONTH,
} from "../schemas/hr.payroll.processing-constants.shared";
import type {
  HrPayrollProrationInput,
  HrPayrollProrationResult,
} from "../schemas/hr.payroll.processing-proration.schema";

const MS_PER_DAY = 86_400_000;

function inclusiveCalendarDays(start: Date, end: Date): number {
  const startUtc = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  );
  const endUtc = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate(),
  );
  return Math.max(1, Math.floor((endUtc - startUtc) / MS_PER_DAY) + 1);
}

function clampDateToPeriod(date: Date, periodStart: Date, periodEnd: Date): Date {
  if (date < periodStart) return periodStart;
  if (date > periodEnd) return periodEnd;
  return date;
}

function prorationFactor(basisDays: number, totalDays: number): number {
  if (totalDays <= 0) return 0;
  return Math.min(1, Math.max(0, basisDays / totalDays));
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** HRM-PAY-014 — salary proration formulas. */
export function calculateHrPayrollProration(
  input: HrPayrollProrationInput,
): HrPayrollProrationResult {
  const totalDays =
    input.workingDaysInPeriod ??
    inclusiveCalendarDays(input.periodStart, input.periodEnd);

  switch (input.reason) {
    case "new_joiner": {
      if (!input.eventDate) {
        throw new Error("new_joiner proration requires eventDate (join date)");
      }
      const joinDate = clampDateToPeriod(
        input.eventDate,
        input.periodStart,
        input.periodEnd,
      );
      const basisDays = inclusiveCalendarDays(joinDate, input.periodEnd);
      const factor = prorationFactor(basisDays, totalDays);
      return {
        reason: input.reason,
        proratedAmount: roundMoney(input.periodAmount * factor),
        basisDays,
        totalDays,
        factor,
        notes: `New joiner: ${basisDays}/${totalDays} days in period`,
      };
    }
    case "resignation": {
      if (!input.eventDate) {
        throw new Error(
          "resignation proration requires eventDate (last working day)",
        );
      }
      const lastDay = clampDateToPeriod(
        input.eventDate,
        input.periodStart,
        input.periodEnd,
      );
      const basisDays = inclusiveCalendarDays(input.periodStart, lastDay);
      const factor = prorationFactor(basisDays, totalDays);
      return {
        reason: input.reason,
        proratedAmount: roundMoney(input.periodAmount * factor),
        basisDays,
        totalDays,
        factor,
        notes: `Resignation: ${basisDays}/${totalDays} days in period`,
      };
    }
    case "unpaid_leave": {
      const unpaidDays = input.unpaidDays ?? 0;
      const factor = prorationFactor(
        Math.max(0, totalDays - unpaidDays),
        totalDays,
      );
      const basisDays = Math.max(0, totalDays - unpaidDays);
      return {
        reason: input.reason,
        proratedAmount: roundMoney(input.periodAmount * factor),
        basisDays,
        totalDays,
        factor,
        notes: `Unpaid leave: ${unpaidDays} unpaid day(s) deducted from ${totalDays}`,
      };
    }
    case "mid_period_salary_change": {
      if (!input.salaryChangeDate) {
        throw new Error(
          "mid_period_salary_change requires salaryChangeDate and segment amounts",
        );
      }
      const priorAmount = input.priorPeriodAmount ?? input.periodAmount;
      const newAmount = input.newPeriodAmount ?? input.periodAmount;
      const changeDate = clampDateToPeriod(
        input.salaryChangeDate,
        input.periodStart,
        input.periodEnd,
      );
      const priorDays = inclusiveCalendarDays(input.periodStart, changeDate) - 1;
      const newDays = inclusiveCalendarDays(changeDate, input.periodEnd);
      const priorFactor = prorationFactor(
        Math.max(0, priorDays),
        totalDays,
      );
      const newFactor = prorationFactor(newDays, totalDays);
      const proratedAmount = roundMoney(
        priorAmount * priorFactor + newAmount * newFactor,
      );
      return {
        reason: input.reason,
        proratedAmount,
        basisDays: Math.max(0, priorDays) + newDays,
        totalDays,
        factor: prorationFactor(proratedAmount, input.periodAmount),
        notes: `Mid-period change on ${changeDate.toISOString().slice(0, 10)}`,
      };
    }
    default: {
      const _exhaustive: never = input.reason;
      throw new Error(`Unsupported proration reason: ${_exhaustive}`);
    }
  }
}

/** Daily rate helper for unpaid-leave deduction previews. */
export function deriveHrPayrollDailyRate(input: {
  periodAmount: number;
  workingDaysInPeriod?: number;
}): number {
  const days = input.workingDaysInPeriod ?? HR_PAYROLL_DEFAULT_WORKING_DAYS_PER_MONTH;
  return roundMoney(input.periodAmount / days);
}
