import { HrCompensationCommandError } from "@afenda/db";
import { actionFailure, type ActionResult } from "@afenda/governed-surface/schemas";

const CPM_GENERIC_FAILURE_MESSAGE = "Compensation planning action failed.";

const CPM_COMMAND_ERROR_MESSAGES: Record<
  HrCompensationCommandError["code"],
  string
> = {
  cycle_not_found: "Compensation cycle was not found.",
  pool_not_found: "Budget pool was not found.",
  participant_not_found: "Cycle participant was not found.",
  recommendation_not_found: "Compensation recommendation was not found.",
  employee_not_found: "Employee was not found.",
  invalid_eligibility_config: "Eligibility rule configuration is invalid.",
  invalid_budget_pool_scope: "Budget pool scope configuration is invalid.",
  invalid_increase_input: "Increase amount or percentage is required.",
  justification_required: "Justification is required for this recommendation.",
  recommendation_locked: "This recommendation is locked and cannot be edited.",
  invalid_status_transition: "This action is not allowed in the current status.",
  approval_step_not_found: "Approval step was not found.",
  salary_change_exists: "A salary change already exists for this recommendation.",
};

export function toHrCpmActionFailure(error: unknown): ActionResult {
  if (error instanceof HrCompensationCommandError) {
    return actionFailure(CPM_COMMAND_ERROR_MESSAGES[error.code]);
  }

  if (error instanceof Error) {
    return actionFailure(error.message);
  }

  return actionFailure(CPM_GENERIC_FAILURE_MESSAGE);
}
