import { HrOtmCommandError } from "@afenda/db";
import {
  actionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import { HrTimeOtmAccessDeniedError } from "../policies/hr.time.otm-access.policy.server";

const HR_OTM_COMMAND_ERROR_MESSAGES: Partial<
  Record<HrOtmCommandError["code"], string>
> = {
  employee_not_found: "Employee record was not found.",
  request_not_found: "Overtime request was not found.",
  invalid_hours: "Overtime hours must be greater than zero and at most 24.",
  invalid_time_range: "End time must be after start time.",
  invalid_status_transition: "This overtime request cannot move to that status.",
  request_not_editable: "This overtime request can no longer be edited.",
  ineligible_without_override:
    "Employee is not eligible for this overtime type unless an authorized override reason is provided.",
  rule_not_found: "Overtime eligibility rule was not found.",
};

export function toHrTimeOtmActionFailure(error: unknown): ActionResult {
  if (error instanceof HrTimeOtmAccessDeniedError) {
    return actionFailure(error.message);
  }
  if (error instanceof HrOtmCommandError) {
    return actionFailure(
      HR_OTM_COMMAND_ERROR_MESSAGES[error.code] ??
        "Overtime request could not be processed.",
    );
  }
  if (error instanceof Error && error.message === "invalid_time_range") {
    return actionFailure(
      HR_OTM_COMMAND_ERROR_MESSAGES.invalid_time_range ??
        "End time must be after start time.",
    );
  }
  if (error instanceof Error && error.message === "invalid_hours") {
    return actionFailure(
      HR_OTM_COMMAND_ERROR_MESSAGES.invalid_hours ??
        "Overtime hours must be greater than zero and at most 24.",
    );
  }
  throw error;
}
