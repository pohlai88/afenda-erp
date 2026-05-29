import { HrComplianceCommandError } from "@afenda/db";
import { actionFailure, type ActionResult } from "@afenda/governed-surface/schemas";

import { HrComplianceOrganizationScopeError } from "./hr.workforce.compliance-org-scope.shared";

const COMPLIANCE_GENERIC_FAILURE_MESSAGE = "Compliance action failed.";

const COMPLIANCE_COMMAND_ERROR_MESSAGES: Record<
  HrComplianceCommandError["code"],
  string
> = {
  obligation_not_found: "Compliance obligation was not found.",
  exception_not_found: "Compliance exception was not found.",
  exception_not_open: "This compliance exception is already closed.",
  requirement_not_found: "Labor law requirement tracking row was not found.",
};

export function toComplianceActionFailure(error: unknown): ActionResult {
  if (error instanceof HrComplianceCommandError) {
    return actionFailure(COMPLIANCE_COMMAND_ERROR_MESSAGES[error.code]);
  }

  if (error instanceof HrComplianceOrganizationScopeError) {
    return actionFailure(error.message);
  }

  return actionFailure(COMPLIANCE_GENERIC_FAILURE_MESSAGE);
}
