import { HrShiftCommandError } from "@afenda/db";
import { actionFailure, type ActionResult } from "@afenda/governed-surface/schemas";

import { HrSftConflictValidationError } from "./hrs-hr-time-sft-conflict-server";

export class HrTimeSftAccessDeniedError extends Error {
  readonly code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const SFT_ERROR_MESSAGES: Record<string, string> = {
  employee_not_found: "Employee was not found in this organization.",
  template_not_found: "Shift type was not found.",
  template_not_active: "Shift type is archived and cannot be assigned.",
  template_code_exists: "A shift type with this code already exists.",
  assignment_not_found: "Shift assignment was not found.",
  assignment_not_scheduled: "Assignment is not in a schedulable state.",
  assignment_date_conflict: "Employee already has a shift on this date.",
  invalid_time_format: "Times must use HH:mm (24-hour) format.",
  recurrence_not_found: "Recurrence rule was not found.",
  recurrence_not_active: "Recurrence rule is archived.",
  recurrence_code_exists: "A recurrence rule with this code already exists.",
  recurrence_days_required: "Select at least one weekday for recurrence.",
  recurrence_employee_required: "Recurrence rule must target an employee.",
  rotation_not_found: "Rotation cycle was not found.",
  rotation_not_active: "Rotation cycle is archived.",
  rotation_code_exists: "A rotation cycle with this code already exists.",
  rotation_cycle_length_invalid: "Rotation cycle length must be at least one day.",
  rotation_steps_required: "Add at least one step before applying a rotation.",
  hr_sft_read_denied: "You do not have permission to view shift schedules.",
  hr_sft_manage_denied: "You do not have permission to manage shift schedules.",
  sft_assignment_conflicts: "Shift assignment conflicts detected.",
};

export function toHrTimeSftActionFailure(error: unknown): ActionResult {
  if (error instanceof HrTimeSftAccessDeniedError) {
    return actionFailure(
      SFT_ERROR_MESSAGES[error.code] ?? error.message,
      undefined,
      error.code,
    );
  }

  if (error instanceof HrSftConflictValidationError) {
    const detail = error.conflicts.map((row) => row.message).join(" ");
    return actionFailure(
      detail || "Shift assignment conflicts detected.",
      undefined,
      error.code,
    );
  }

  if (error instanceof HrShiftCommandError) {
    return actionFailure(
      SFT_ERROR_MESSAGES[error.code] ?? error.message,
      undefined,
      error.code,
    );
  }

  if (error instanceof Error) {
    return actionFailure(error.message, undefined, "hr_sft_unexpected_error");
  }

  return actionFailure(
    "Shift scheduling request failed.",
    undefined,
    "hr_sft_unexpected_error",
  );
}
