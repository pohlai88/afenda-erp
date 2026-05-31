import { parseNumeric } from "@afenda/db";

import {
  hrMcpOvertimeCalculationInputSchema,
  type HrMcpOvertimeCalculationInput,
  type HrMcpOvertimeCalculationResult,
  type HrMcpUpsertOvertimeRuleInput,
} from "../schemas/hr.payroll.mcp-calculation-rules.schema";

function roundPayrollAmount(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function readPositiveNumber(value: string | null | undefined, fallback: number): number {
  if (value === null || value === undefined) {
    return fallback;
  }
  const parsed = parseNumeric(value);
  if (parsed === null || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

/** MCP-012 — map stored overtime rule to calculation multipliers. */
export function mapOvertimeRuleToCalculationInput(
  rule: Pick<
    HrMcpUpsertOvertimeRuleInput,
    | "overtimeRateMultiplier"
    | "restDayRateMultiplier"
    | "publicHolidayRateMultiplier"
  >,
  base: Pick<
    HrMcpOvertimeCalculationInput,
    "baseHourlyRate" | "regularHours" | "overtimeHours" | "restDayHours" | "publicHolidayHours"
  >,
): HrMcpOvertimeCalculationInput {
  return hrMcpOvertimeCalculationInputSchema.parse({
    ...base,
    overtimeRateMultiplier: readPositiveNumber(
      rule.overtimeRateMultiplier,
      1.5,
    ),
    restDayRateMultiplier: readPositiveNumber(rule.restDayRateMultiplier, 2),
    publicHolidayRateMultiplier: readPositiveNumber(
      rule.publicHolidayRateMultiplier,
      2,
    ),
  });
}

/** MCP-012 — calculate overtime, rest-day, and public-holiday pay. */
export function calculateOvertimePay(
  rawInput: HrMcpOvertimeCalculationInput,
): HrMcpOvertimeCalculationResult {
  const input = hrMcpOvertimeCalculationInputSchema.parse(rawInput);

  const regularPay = roundPayrollAmount(input.baseHourlyRate * input.regularHours);
  const overtimePay = roundPayrollAmount(
    input.baseHourlyRate * input.overtimeHours * input.overtimeRateMultiplier,
  );
  const restDayPay = roundPayrollAmount(
    input.baseHourlyRate * input.restDayHours * input.restDayRateMultiplier,
  );
  const publicHolidayPay = roundPayrollAmount(
    input.baseHourlyRate *
      input.publicHolidayHours *
      input.publicHolidayRateMultiplier,
  );

  return {
    regularPay,
    overtimePay,
    restDayPay,
    publicHolidayPay,
    totalPay: roundPayrollAmount(
      regularPay + overtimePay + restDayPay + publicHolidayPay,
    ),
  };
}

/** MCP-012 — enforce weekly hour ceiling when configured on the rule. */
export function exceedsMaxWeeklyHours(input: {
  regularHours: number;
  overtimeHours: number;
  restDayHours: number;
  publicHolidayHours: number;
  maxWeeklyHours: string | null | undefined;
}): boolean {
  const maxWeeklyHours = readPositiveNumber(input.maxWeeklyHours, Number.POSITIVE_INFINITY);
  if (!Number.isFinite(maxWeeklyHours)) {
    return false;
  }
  const totalHours =
    input.regularHours +
    input.overtimeHours +
    input.restDayHours +
    input.publicHolidayHours;
  return totalHours > maxWeeklyHours;
}
