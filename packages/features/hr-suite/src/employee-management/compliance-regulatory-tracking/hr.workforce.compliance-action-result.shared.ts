import { HrComplianceCommandError } from "@afenda/db";
import { actionFailure, type ActionResult } from "@afenda/governed-surface/schemas";

import {
  HrComplianceOrganizationScopeError,
  HrComplianceSensitiveAccessError,
} from "./hr.workforce.compliance-org-scope.shared";

const COMPLIANCE_GENERIC_FAILURE_MESSAGE = "Compliance action failed.";

const COMPLIANCE_COMMAND_ERROR_MESSAGES = {
  obligation_not_found: "Compliance obligation was not found.",
  exception_not_found: "Compliance exception was not found.",
  exception_not_open: "This compliance exception is already closed.",
  corrective_action_not_assigned:
    "Assign a corrective action owner before recording progress.",
  corrective_action_assignment_incomplete:
    "Corrective action owner and due date must be assigned together.",
  corrective_action_owner_not_found:
    "Corrective action owner employee was not found.",
  requirement_not_found: "Compliance requirement tracking row was not found.",
  work_eligibility_not_found: "Work eligibility tracking row was not found.",
  work_auth_document_not_found: "Work authorization document row was not found.",
  filing_not_found: "Mandatory filing row was not found.",
  invalid_exception_gap_kind: "Compliance exception gap kind is invalid.",
  evidence_source_not_found: "Compliance record for evidence linking was not found.",
  evidence_document_not_found:
    "Supporting employee document was not found or is not active.",
  evidence_document_employee_mismatch:
    "Selected document does not belong to the compliance record employee.",
  evidence_link_not_found: "Compliance evidence link was not found.",
  evidence_link_already_exists:
    "This document is already linked to the compliance record.",
  invalid_evidence_submission_state: "Evidence submission state is invalid.",
  invalid_evidence_record_kind: "Compliance record type for evidence linking is invalid.",
} satisfies Record<HrComplianceCommandError["code"], string>;

export function toComplianceActionFailure(error: unknown): ActionResult {
  if (error instanceof HrComplianceCommandError) {
    return actionFailure(COMPLIANCE_COMMAND_ERROR_MESSAGES[error.code]);
  }

  if (error instanceof HrComplianceOrganizationScopeError) {
    return actionFailure(error.message);
  }

  if (error instanceof HrComplianceSensitiveAccessError) {
    return actionFailure(error.message);
  }

  return actionFailure(COMPLIANCE_GENERIC_FAILURE_MESSAGE);
}
