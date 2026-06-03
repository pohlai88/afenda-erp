import { deriveFilingEffectiveStatus as deriveDbFilingEffectiveStatus } from "@afenda/db";

import { toEnumMember } from "./hr.workforce.compliance-enum-guard.shared";

/** HRM-CMP-009 stored filing workflow statuses writable via trailing actions. */
export const HRM_COMPLIANCE_FILING_STORED_STATUSES = [
  "pending",
  "submitted",
  "confirmed",
  "waived",
] as const;

export type HrmComplianceFilingStoredStatus =
  (typeof HRM_COMPLIANCE_FILING_STORED_STATUSES)[number];

/** Physical enum values on `hr_compliance_filings.status`. */
export const HRM_COMPLIANCE_FILING_DB_STATUSES = [
  ...HRM_COMPLIANCE_FILING_STORED_STATUSES,
  "overdue",
] as const;

export type HrmComplianceFilingDbStatus =
  (typeof HRM_COMPLIANCE_FILING_DB_STATUSES)[number];

/** HRM-CMP-009 effective filing posture including derived overdue. */
export const HRM_COMPLIANCE_FILING_EFFECTIVE_STATUSES = [
  ...HRM_COMPLIANCE_FILING_DB_STATUSES,
] as const;

export type HrmComplianceFilingEffectiveStatus =
  (typeof HRM_COMPLIANCE_FILING_EFFECTIVE_STATUSES)[number];

export function deriveEffectiveFilingStatus(input: {
  status: HrmComplianceFilingDbStatus;
  filingDeadline: Date | null | undefined;
  now?: Date;
}): HrmComplianceFilingEffectiveStatus {
  return toEnumMember(
    deriveDbFilingEffectiveStatus({
      status: input.status,
      filingDeadline: input.filingDeadline ?? null,
      now: input.now ?? new Date(),
    }),
    HRM_COMPLIANCE_FILING_EFFECTIVE_STATUSES,
    "filing status",
  );
}

export function normalizeFilingStatusForTrailingSelect(
  status: HrmComplianceFilingDbStatus,
): HrmComplianceFilingStoredStatus {
  return status === "overdue" ? "pending" : status;
}
