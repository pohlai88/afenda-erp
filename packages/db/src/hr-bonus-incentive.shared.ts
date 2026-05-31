export class HrBonusCommandError extends Error {
  readonly code:
    | "plan_not_found"
    | "cycle_not_found"
    | "target_not_found"
    | "achievement_not_found"
    | "formula_not_found"
    | "employee_not_found"
    | "rule_not_found"
    | "participant_not_found"
    | "participant_not_assigned"
    | "participant_already_assigned"
    | "invalid_target_scope"
    | "invalid_target_value"
    | "invalid_actual_value"
    | "invalid_formula_config"
    | "invalid_tier_config"
    | "invalid_accelerator_config"
    | "invalid_cycle_dates"
    | "ineligible_for_payout"
    | "payout_validation_failed"
    | "payout_not_found"
    | "payout_locked"
    | "invalid_payout_status"
    | "approval_step_not_found"
    | "rejection_reason_required"
    | "adjustment_reason_required"
    | "return_reason_required"
    | "adjusted_amount_required";

  constructor(code: HrBonusCommandError["code"], message?: string) {
    super(message ?? code);
    this.name = "HrBonusCommandError";
    this.code = code;
  }
}

export function parseNumeric(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatNumeric(value: number, scale = 4): string {
  return value.toFixed(scale);
}
