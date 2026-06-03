import { HrMcpCommandError } from "@afenda/db";
import {
  actionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import { HrMcpAuditAccessError, HrMcpStatutoryAccessError } from "./hr.payroll.mcp-statutory-admin.policy.server";
import { HrMcpRuleVersionError } from "./hr.payroll.mcp-rule-versioning.shared";

const MCP_GENERIC_FAILURE_MESSAGE = "Multi-country payroll action failed.";

const MCP_COMMAND_ERROR_MESSAGES: Record<
  HrMcpCommandError["code"],
  string
> = {
  country_config_not_found: "Country payroll configuration was not found.",
  legal_entity_setup_not_found: "Legal entity payroll setup was not found.",
  rule_version_not_found: "Country rule version was not found.",
  rule_version_locked: "Country rule version is locked and cannot be edited.",
  invalid_rule_version_transition: "Country rule version status transition is invalid.",
  employee_not_found: "Employee was not found.",
  duplicate_country_code: "A country payroll configuration already exists for this country code.",
  duplicate_legal_entity_code: "A legal entity setup already exists for this code.",
  invalid_effective_range: "Effective end date must be on or after the effective start date.",
  snapshot_not_found: "Finalized payroll rule snapshot was not found.",
  report_config_not_found: "Country report configuration was not found.",
};

export function toHrMcpActionFailure(error: unknown): ActionResult {
  if (error instanceof HrMcpStatutoryAccessError) {
    return actionFailure(error.message, undefined, "statutory_access_denied");
  }

  if (error instanceof HrMcpAuditAccessError) {
    return actionFailure(error.message, undefined, "audit_access_denied");
  }

  if (error instanceof HrMcpRuleVersionError) {
    return actionFailure(error.message, undefined, error.code);
  }

  if (error instanceof HrMcpCommandError) {
    return actionFailure(
      MCP_COMMAND_ERROR_MESSAGES[error.code] ?? error.message,
      undefined,
      error.code,
    );
  }

  if (error instanceof Error) {
    return actionFailure(error.message || MCP_GENERIC_FAILURE_MESSAGE);
  }

  return actionFailure(MCP_GENERIC_FAILURE_MESSAGE);
}
