import { HrLamCommandError } from "@afenda/db";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

const LAM_ACTION_MESSAGES: Partial<Record<HrLamCommandError["code"], string>> = {
  leave_application_policy_violation:
    "Leave application does not meet policy rules (notice, duration, blackout, or overlap).",
  rejection_reason_required: "A rejection reason is required.",
  unauthorized_approver: "You are not authorized to decide this leave request.",
  cancellation_not_allowed: "Cancellation is not allowed for this request.",
  amendment_not_allowed: "Amendment is not allowed for this request.",
  adjustment_reason_required: "A reason is required for balance adjustment.",
  insufficient_leave_balance: "Insufficient leave balance.",
  request_not_actionable: "This leave request cannot be updated.",
};

export function toHrTimeLeaveActionFailure(error: unknown): ActionResult {
  if (error instanceof HrLamCommandError) {
    return actionFailure(
      LAM_ACTION_MESSAGES[error.code] ?? "Leave request could not be processed.",
    );
  }
  if (error instanceof Error && error.message === "hr_leave_write_required") {
    return actionFailure("You do not have permission to modify leave records.");
  }
  throw error;
}

export function toHrTimeLeaveActionSuccess<T>(value: T): ActionResult<T> {
  return actionSuccess(value);
}
