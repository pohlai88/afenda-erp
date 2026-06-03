import {
  hrMcpLeavePayrollCalculationInputSchema,
  type HrMcpLeavePayrollCalculationInput,
  type HrMcpLeavePayrollCalculationResult,
} from "./hr.payroll.mcp-calculation-rules.schema";
import type { HrMcpLeavePayrollImpact } from "./hr.payroll.mcp-constants.shared";

function roundPayrollAmount(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function calculatePaidAndUnpaidAmounts(
  payrollImpact: HrMcpLeavePayrollImpact,
  leaveDays: number,
  dailyRate: number,
  statutoryDailyRate: number | null | undefined,
): { paidAmount: number; unpaidAmount: number } {
  const grossLeaveValue = roundPayrollAmount(leaveDays * dailyRate);

  switch (payrollImpact) {
    case "paid":
      return { paidAmount: grossLeaveValue, unpaidAmount: 0 };
    case "unpaid":
    case "no_pay":
      return { paidAmount: 0, unpaidAmount: grossLeaveValue };
    case "statutory_paid": {
      const statutoryRate = statutoryDailyRate ?? dailyRate;
      const paidAmount = roundPayrollAmount(leaveDays * statutoryRate);
      return {
        paidAmount,
        unpaidAmount: roundPayrollAmount(Math.max(grossLeaveValue - paidAmount, 0)),
      };
    }
    default:
      return { paidAmount: 0, unpaidAmount: grossLeaveValue };
  }
}

/** MCP-013 — calculate leave payroll impact amounts for a country treatment. */
export function calculateLeavePayrollImpact(
  rawInput: HrMcpLeavePayrollCalculationInput,
): HrMcpLeavePayrollCalculationResult {
  const input = hrMcpLeavePayrollCalculationInputSchema.parse(rawInput);
  const { paidAmount, unpaidAmount } = calculatePaidAndUnpaidAmounts(
    input.payrollImpact,
    input.leaveDays,
    input.dailyRate,
    input.statutoryDailyRate,
  );

  return {
    leaveTypeCode: input.leaveTypeCode,
    payrollImpact: input.payrollImpact,
    paidAmount,
    unpaidAmount,
    leaveDays: input.leaveDays,
  };
}

/** MCP-013 — resolve leave treatment by code from an in-memory rule list. */
export function resolveLeavePayrollTreatment<T extends { leaveTypeCode: string; payrollImpact: HrMcpLeavePayrollImpact }>(
  leaveTypeCode: string,
  treatments: readonly T[],
): T | null {
  const normalized = leaveTypeCode.trim().toLowerCase();
  return (
    treatments.find(
      (treatment) => treatment.leaveTypeCode.trim().toLowerCase() === normalized,
    ) ?? null
  );
}
