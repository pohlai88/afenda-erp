import {
  HrLifecycleCommandError,
  HrOffboardingCommandError,
  HrOnboardingCommandError,
} from "@afenda/db";
import { actionFailure, type ActionResult } from "@afenda/governed-surface/schemas";

const LIFECYCLE_GENERIC_FAILURE_MESSAGE = "Lifecycle action failed.";

const LIFECYCLE_COMMAND_ERROR_MESSAGES = {
  employee_not_found: "Employee was not found.",
  employee_archived: "Archived employees cannot receive lifecycle changes.",
  invalid_status_transition: "That employment status transition is not allowed.",
  transition_not_found: "Scheduled transition was not found.",
  transition_not_pending: "Only pending scheduled transitions can be cancelled.",
} satisfies Record<HrLifecycleCommandError["code"], string>;

const OFFBOARDING_COMMAND_ERROR_MESSAGES = {
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
} satisfies Record<HrOffboardingCommandError["code"], string>;

const ONBOARDING_COMMAND_ERROR_MESSAGES = {
  employee_not_found: "Employee was not found.",
  employee_archived: "Archived employees cannot start onboarding.",
  employee_not_onboarding: "Employee must be in onboarding stage to start a checklist.",
  case_not_found: "Onboarding case was not found.",
  case_not_in_progress: "Onboarding case is not in progress.",
  active_case_exists: "An onboarding case is already in progress for this employee.",
  checklist_incomplete: "Complete all checklist items before finishing onboarding.",
  invalid_status_transition: "Employee stage does not allow onboarding completion.",
} satisfies Record<HrOnboardingCommandError["code"], string>;

export function toLifecycleActionFailure(error: unknown): ActionResult {
  if (error instanceof HrLifecycleCommandError) {
    return actionFailure(LIFECYCLE_COMMAND_ERROR_MESSAGES[error.code]);
  }
  if (error instanceof HrOffboardingCommandError) {
    return actionFailure(OFFBOARDING_COMMAND_ERROR_MESSAGES[error.code]);
  }
  if (error instanceof HrOnboardingCommandError) {
    return actionFailure(ONBOARDING_COMMAND_ERROR_MESSAGES[error.code]);
  }

  return actionFailure(LIFECYCLE_GENERIC_FAILURE_MESSAGE);
}
