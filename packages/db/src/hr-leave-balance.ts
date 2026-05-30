export type HrLeaveBalanceComponents = {
  openingDays: number;
  earnedDays: number;
  usedDays: number;
  pendingDays: number;
  adjustedDays: number;
  forfeitedDays: number;
  carriedForwardDays: number;
};

export function computeLeaveRemainingBalance(
  components: HrLeaveBalanceComponents,
): number {
  const total =
    components.openingDays +
    components.earnedDays +
    components.adjustedDays +
    components.carriedForwardDays;
  const consumed =
    components.usedDays +
    components.pendingDays +
    components.forfeitedDays;
  const remaining = total - consumed;
  if (!Number.isFinite(remaining)) {
    throw new Error("leave_balance_corrupt");
  }
  return Math.round(remaining * 100) / 100;
}

export function parseBalanceAmount(value: string | number): number {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) {
    throw new Error("leave_balance_amount_invalid");
  }
  return amount;
}

export function formatBalanceAmount(amount: number): string {
  return amount.toFixed(2);
}

export function assertSufficientLeaveBalance(input: {
  components: HrLeaveBalanceComponents;
  reserveDays: number;
}): void {
  const remaining = computeLeaveRemainingBalance(input.components);
  if (input.reserveDays > remaining) {
    throw new Error("insufficient_leave_balance");
  }
}
