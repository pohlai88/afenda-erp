import {
  HrOffboardingCommandError,
  type HrOffboardingCommandError as HrOffboardingCommandErrorType,
} from "@afenda/db";
import {
  actionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

const OFFBOARDING_ERROR_MESSAGES = {
  employee_not_found: "Employee was not found.",
  employee_archived: "Archived employees cannot start offboarding.",
  case_not_found: "Offboarding case was not found.",
  case_not_in_progress: "Offboarding case is not in progress.",
  active_case_exists: "An offboarding case is already in progress for this employee.",
  clearance_incomplete: "Complete all clearance items before finishing offboarding.",
  clearance_item_not_found: "Clearance item was not found.",
  approval_incomplete: "Complete all approval steps before finishing offboarding.",
  approval_step_not_found: "Approval step was not found.",
  asset_not_found: "Asset record was not found.",
  blocker_not_found: "Settlement blocker was not found.",
  document_not_found: "Document link was not found.",
  invalid_status_transition: "Employee stage does not allow offboarding.",
  invalid_notice_period: "Notice period does not meet policy requirements.",
  settlement_not_ready: "Final settlement is not ready for closure.",
} satisfies Record<HrOffboardingCommandErrorType["code"], string>;

export function toOffboardingActionFailure(error: unknown): ActionResult {
  if (error instanceof HrOffboardingCommandError) {
    return actionFailure(
      OFFBOARDING_ERROR_MESSAGES[error.code] ?? error.message,
    );
  }
  if (error instanceof Error) {
    return actionFailure(error.message);
  }
  return actionFailure("Offboarding action failed.");
}
