import type { HrComplianceReviewQueueEntryKind } from "@afenda/db";

import { formatComplianceEnumLabel } from "./hr.workforce.compliance-form.shared";

export function formatComplianceReviewQueueEntryKindLabel(
  entryKind: HrComplianceReviewQueueEntryKind,
): string {
  switch (entryKind) {
    case "filing_confirmation":
      return "Filing confirmation";
    case "work_eligibility_verification":
      return "Work eligibility";
    case "work_auth_verification":
      return "Work authorization";
    case "evidence_acknowledgment":
      return "Evidence acknowledgment";
    default:
      return formatComplianceEnumLabel(entryKind);
  }
}

export function formatComplianceReviewQueueRequiredActionLabel(
  entryKind: HrComplianceReviewQueueEntryKind,
): string {
  switch (entryKind) {
    case "filing_confirmation":
      return "Confirm filing";
    case "work_eligibility_verification":
      return "Verify eligibility";
    case "work_auth_verification":
      return "Verify document";
    case "evidence_acknowledgment":
      return "Acknowledge evidence";
    default:
      return "Review";
  }
}

export function isSensitiveComplianceReviewQueueEntryKind(
  entryKind: HrComplianceReviewQueueEntryKind,
): boolean {
  return (
    entryKind === "work_eligibility_verification" ||
    entryKind === "work_auth_verification" ||
    entryKind === "evidence_acknowledgment"
  );
}
