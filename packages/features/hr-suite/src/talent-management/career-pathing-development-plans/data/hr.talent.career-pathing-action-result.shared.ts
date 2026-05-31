import { HrCareerPathingCommandError } from "@afenda/db";
import {
  actionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import { HrCareerPathAccessDeniedError } from "../policies/hr.talent.career-pathing-access.policy.server";

const GENERIC_FAILURE = "Career pathing action failed.";

const COMMAND_ERROR_MESSAGES: Record<string, string> = {
  employee_not_found: "Employee was not found.",
  framework_not_found: "Career path framework was not found.",
  stage_not_found: "Career path stage was not found.",
  development_plan_not_found: "Development plan was not found.",
  goal_not_found: "Development goal was not found.",
  milestone_not_found: "Development milestone was not found.",
};

export function toHrTalentCareerPathActionFailure(error: unknown): ActionResult {
  if (error instanceof HrCareerPathAccessDeniedError) {
    return actionFailure(error.message);
  }
  if (error instanceof HrCareerPathingCommandError) {
    return actionFailure(
      COMMAND_ERROR_MESSAGES[error.code] ?? error.message,
      undefined,
      error.code,
    );
  }
  if (error instanceof Error) {
    return actionFailure(error.message || GENERIC_FAILURE);
  }
  return actionFailure(GENERIC_FAILURE);
}
