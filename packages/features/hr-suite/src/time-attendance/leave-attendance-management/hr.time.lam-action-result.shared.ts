import { HrLamCommandError } from "@afenda/db";
import {
  actionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

const LAM_ERROR_MESSAGES: Record<HrLamCommandError["code"], string> = {
  employee_not_found: "Employee was not found.",
  attendance_day_not_found: "Attendance day was not found.",
  invalid_date_range: "End date must be on or after start date.",
  leave_type_not_configured: "Leave type is not configured for this policy group.",
  leave_type_inactive: "Leave type is inactive.",
  supporting_document_required: "Supporting document is required for this leave type.",
  insufficient_leave_balance: "Insufficient leave balance.",
  leave_not_eligible: "Employee is not eligible for this leave type.",
  employee_not_confirmed: "Employee must be confirmed before taking this leave.",
  request_not_found: "Leave request was not found.",
  request_not_pending: "Leave request is not pending.",
  request_not_actionable: "Leave request cannot be changed in its current state.",
  entitlement_rule_not_found: "Entitlement rule was not found.",
  leave_application_policy_violation: "Leave application violates policy rules.",
  leave_policy_not_found: "Leave policy was not found.",
  rejection_reason_required: "A rejection reason is required.",
  unauthorized_approver: "You are not authorized to approve this request.",
  cancellation_not_allowed: "This leave request cannot be cancelled.",
  amendment_not_allowed: "This leave request cannot be amended.",
  adjustment_reason_required: "An adjustment reason is required.",
  medical_certificate_required: "Medical certificate reference is required.",
  attendance_corrections_disabled: "Attendance corrections are disabled for this policy.",
  attendance_day_locked: "Attendance day is locked and cannot be changed.",
  correction_request_not_found: "Correction request was not found.",
  correction_request_not_pending: "Correction request is not pending approval.",
};

export function toHrLamActionFailure(error: unknown): ActionResult {
  if (error instanceof HrLamCommandError) {
    return actionFailure(
      LAM_ERROR_MESSAGES[error.code],
      undefined,
      error.code,
    );
  }
  throw error;
}
