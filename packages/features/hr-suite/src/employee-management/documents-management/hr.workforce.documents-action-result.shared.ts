import { HrDocumentCommandError } from "@afenda/db";
import { actionFailure, type ActionResult } from "@afenda/governed-surface/schemas";

import { HrDocumentsSensitiveAccessError } from "./hr.workforce.documents-org-scope.shared";

const DOCUMENTS_GENERIC_FAILURE_MESSAGE = "Document action failed.";

const DOCUMENTS_COMMAND_ERROR_MESSAGES = {
  employee_not_found: "Employee was not found.",
  document_not_found: "Document was not found.",
  document_archived: "This document is already archived.",
  document_not_archived: "This document is not archived.",
  document_legal_hold: "Documents on legal hold cannot be changed.",
  invalid_replacement: "Document replacement is not allowed for this record.",
  sensitive_access_denied:
    "Sensitive document access is required for this action.",
} satisfies Record<HrDocumentCommandError["code"], string>;

export function toDocumentsActionFailure(error: unknown): ActionResult {
  if (error instanceof HrDocumentCommandError) {
    return actionFailure(DOCUMENTS_COMMAND_ERROR_MESSAGES[error.code]);
  }

  if (error instanceof HrDocumentsSensitiveAccessError) {
    return actionFailure(
      "Sensitive document access is required for this action.",
    );
  }

  if (error instanceof Error) {
    return actionFailure(error.message);
  }

  return actionFailure(DOCUMENTS_GENERIC_FAILURE_MESSAGE);
}
