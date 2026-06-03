import {
  actionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { HrOtmCommandError } from "@afenda/db";

import { HrTimeOtmAccessDeniedError } from "./hr.time.otm-access.policy.server";

const HR_OTM_COMMAND_ERROR_MESSAGES: Record<string, string> = {
  request_not_found: "Overtime request was not found.",
  request_not_editable: "Overtime request is not editable.",
  invalid_status_transition: "Overtime status transition is not allowed.",
  ineligible_without_override:
    "Employee is not eligible for overtime without an authorized override.",
};

export async function toHrTimeOtmActionFailure<T = void>(
  error: unknown,
): Promise<ActionResult<T>> {
  if (error instanceof HrTimeOtmAccessDeniedError) {
    return actionFailure(error.message);
  }
  if (error instanceof HrOtmCommandError) {
    return actionFailure(
      HR_OTM_COMMAND_ERROR_MESSAGES[error.code] ??
        "Overtime request could not be processed.",
    );
  }
  throw error;
}

export const HR_TIME_OTM_REVALIDATE_PATH = "/apps/hrm/overtime";
