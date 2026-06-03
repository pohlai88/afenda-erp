import { HrBonusCommandError, HrBonusPayoutCommandError } from "@afenda/db";
import {
  actionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

const BONUS_GENERIC_FAILURE_MESSAGE = "Bonus action failed.";

const BONUS_COMMAND_ERROR_MESSAGES: Record<
  HrBonusCommandError["code"],
  string
> = {
  plan_not_found: "Bonus plan was not found.",
  cycle_not_found: "Bonus cycle was not found.",
  target_not_found: "Bonus target was not found.",
  achievement_not_found: "Bonus achievement was not found.",
  formula_not_found: "Payout formula was not found for this plan.",
  employee_not_found: "Employee was not found.",
  rule_not_found: "Eligibility rule was not found.",
  participant_not_found: "Plan participant was not found.",
  participant_not_assigned: "Employee is not assigned to this bonus plan.",
  participant_already_assigned: "Employee is already assigned to this plan.",
  invalid_target_scope: "Target scope is incomplete for the selected target kind.",
  invalid_target_value: "Target value is invalid.",
  invalid_actual_value: "Actual achievement must be a non-negative number.",
  invalid_formula_config: "Payout formula configuration is invalid.",
  invalid_tier_config: "Commission tier configuration is invalid.",
  invalid_accelerator_config: "Accelerator rule configuration is invalid.",
  invalid_cycle_dates: "Cycle period end must be on or after period start.",
  ineligible_for_payout: "Employee is not eligible for bonus payout.",
  payout_validation_failed: "Resolve payout validation flags before calculation.",
  payout_not_found: "Bonus payout was not found.",
  payout_locked: "Bonus payout is locked and cannot be edited.",
  invalid_payout_status: "Payout status does not allow this action.",
  approval_step_not_found: "No pending approval step was found for this payout.",
  rejection_reason_required: "Rejection reason is required.",
  adjustment_reason_required: "Adjustment reason is required.",
  return_reason_required: "Return reason is required.",
  adjusted_amount_required: "Adjusted amount is required.",
};

export function toBonusActionFailure<T = void>(error: unknown): ActionResult<T> {
  if (error instanceof HrBonusCommandError) {
    return actionFailure<T>(
      BONUS_COMMAND_ERROR_MESSAGES[error.code] ?? error.message,
      undefined,
      error.code,
    );
  }

  if (error instanceof HrBonusPayoutCommandError) {
    return actionFailure<T>(error.message, undefined, error.code);
  }

  if (error instanceof Error) {
    return actionFailure<T>(error.message || BONUS_GENERIC_FAILURE_MESSAGE);
  }

  return actionFailure<T>(BONUS_GENERIC_FAILURE_MESSAGE);
}
