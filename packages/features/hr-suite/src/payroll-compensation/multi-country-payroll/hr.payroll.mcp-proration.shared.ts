import { parseNumeric } from "@afenda/db";

import {
  hrMcpProrationCalculationInputSchema,
  type HrMcpProrationCalculationInput,
  type HrMcpProrationCalculationResult,
} from "./hr.payroll.mcp-calculation-rules.schema";
import type { HrMcpProrationBasis } from "./hr.payroll.mcp-constants.shared";

function parseIsoDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function inclusiveDayCount(start: string, end: string): number {
  const startMs = parseIsoDate(start).getTime();
  const endMs = parseIsoDate(end).getTime();
  if (endMs < startMs) {
    return 0;
  }
  return Math.floor((endMs - startMs) / 86_400_000) + 1;
}

function clampFactor(factor: number): number {
  if (!Number.isFinite(factor)) {
    return 0;
  }
  return Math.min(1, Math.max(0, factor));
}

function roundPayrollAmount(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function resolveProrationFactor(
  input: HrMcpProrationCalculationInput,
): number {
  switch (input.basis) {
    case "calendar_days": {
      const periodDays = inclusiveDayCount(input.periodStart, input.periodEnd);
      if (periodDays <= 0) {
        return 0;
      }
      const eventStart = input.eventStart ?? input.periodStart;
      const eventEnd = input.eventEnd ?? input.periodEnd;
      const overlapStart = eventStart > input.periodStart ? eventStart : input.periodStart;
      const overlapEnd = eventEnd < input.periodEnd ? eventEnd : input.periodEnd;
      const workedDays = inclusiveDayCount(overlapStart, overlapEnd);
      return clampFactor(workedDays / periodDays);
    }
    case "working_days": {
      const periodWorkingDays = input.workingDaysInPeriod ?? 0;
      const workedDays = input.workingDaysWorked ?? 0;
      if (periodWorkingDays <= 0) {
        return 0;
      }
      return clampFactor(workedDays / periodWorkingDays);
    }
    case "monthly_fraction":
      return 1;
    default:
      return 0;
  }
}

/** MCP-011 — calculate prorated pay amount for a country rule basis. */
export function calculateProratedPayAmount(
  rawInput: HrMcpProrationCalculationInput,
): HrMcpProrationCalculationResult {
  const input = hrMcpProrationCalculationInputSchema.parse(rawInput);
  const prorationFactor = resolveProrationFactor(input);
  const proratedAmount = roundPayrollAmount(
    input.fullPeriodAmount * prorationFactor,
  );

  return {
    proratedAmount,
    prorationFactor,
    basis: input.basis satisfies HrMcpProrationBasis,
    scenario: input.scenario,
  };
}

/** MCP-011 — parse numeric rule config values from stored rule payloads. */
export function readProrationRuleNumericConfig(
  ruleConfig: Record<string, unknown>,
  key: string,
): number | null {
  const value = ruleConfig[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    return parseNumeric(value);
  }
  return null;
}
