import { HrBenefitsCommandError } from "@afenda/db";
import { actionFailure, type ActionResult } from "@afenda/governed-surface/schemas";

const BENEFITS_GENERIC_FAILURE_MESSAGE = "Benefits action failed.";

const BENEFITS_COMMAND_ERROR_MESSAGES = {
  plan_not_found: "Benefit plan was not found.",
  plan_archived: "Benefit plan is archived.",
  rule_not_found: "Benefit eligibility rule was not found.",
  window_not_found: "Open enrollment window was not found.",
  employee_not_found: "Employee was not found.",
  employee_ineligible: "Employee is not eligible for this benefit plan.",
  open_enrollment_closed: "Open enrollment window is closed.",
  open_enrollment_plan_not_in_window:
    "Benefit plan is not included in the open enrollment window.",
  life_event_not_found: "Benefit life event was not found.",
  enrollment_not_found: "Benefit enrollment was not found.",
  enrollment_not_pending: "Benefit enrollment is not pending approval.",
  enrollment_not_active: "Benefit enrollment is not active.",
  provider_not_found: "Benefit provider was not found.",
  deduction_reference_not_found: "Payroll deduction reference was not found.",
  document_not_found: "Supporting document reference was not found.",
  document_link_not_found: "Benefit document link was not found.",
  employee_contribution_missing: "Employee contribution amount is required for payroll deduction.",
  invalid_change_kind: "Benefit enrollment change type is invalid.",
  invalid_window_dates: "Open enrollment window dates are invalid.",
  invalid_coverage_transition: "Benefit coverage status transition is not allowed.",
  coverage_level_not_allowed: "Coverage level is not allowed for this benefit plan.",
  coverage_dates_invalid: "Coverage end date must be on or after the start date.",
  dependents_not_allowed: "Dependents are not allowed for the selected coverage level.",
  dependent_name_required: "Dependent name is required.",
  dependent_relationship_not_allowed:
    "Dependent relationship does not match the selected coverage level.",
  dependent_date_of_birth_required: "Date of birth is required for child dependents.",
  dependent_not_verified: "Dependent eligibility could not be verified.",
  plan_dependents_not_supported: "This benefit plan does not support dependent coverage.",
};

export function toBenefitsActionFailure(error: unknown): ActionResult {
  if (error instanceof HrBenefitsCommandError) {
    return actionFailure(
      BENEFITS_COMMAND_ERROR_MESSAGES[error.code] ?? error.message,
    );
  }

  return actionFailure(BENEFITS_GENERIC_FAILURE_MESSAGE);
}
