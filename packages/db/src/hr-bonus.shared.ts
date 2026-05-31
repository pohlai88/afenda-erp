export class HrBonusPayoutCommandError extends Error {
  readonly code:
    | "plan_not_found"
    | "cycle_not_found"
    | "payout_not_found"
    | "payout_not_approved"
    | "payout_locked"
    | "payout_not_locked"
    | "payroll_reference_not_found"
    | "invalid_accounting_allocation"
    | "invalid_payout_status";

  constructor(code: HrBonusPayoutCommandError["code"], message?: string) {
    super(message ?? code);
    this.name = "HrBonusPayoutCommandError";
    this.code = code;
  }
}

export function buildBonusEarningsCode(planCode: string, planType: string): string {
  const typeToken = planType.replace(/_/g, "-").toUpperCase();
  return `BON-${typeToken}-${planCode.trim().toUpperCase()}`;
}

export const HR_BONUS_LOCKED_PAYOUT_STATUSES = ["locked"] as const;

export const HR_BONUS_EDITABLE_PAYOUT_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "returned",
] as const;

export function isHrBonusPayoutLocked(input: {
  payoutStatus: string;
  lockedAt: Date | null;
}): boolean {
  return input.lockedAt != null || input.payoutStatus === "locked";
}
