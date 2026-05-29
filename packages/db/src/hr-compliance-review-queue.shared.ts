/** HRM-CMP-021 review queue entry kinds (derived read model). */
export const HR_COMPLIANCE_REVIEW_QUEUE_ENTRY_KINDS = [
  "filing_confirmation",
  "work_eligibility_verification",
  "work_auth_verification",
  "evidence_acknowledgment",
] as const;

export type HrComplianceReviewQueueEntryKind =
  (typeof HR_COMPLIANCE_REVIEW_QUEUE_ENTRY_KINDS)[number];

export const HR_COMPLIANCE_REVIEW_QUEUE_MERGE_CAP = 1000;

export function isHrComplianceReviewQueueEntryKind(
  value: string,
): value is HrComplianceReviewQueueEntryKind {
  return (HR_COMPLIANCE_REVIEW_QUEUE_ENTRY_KINDS as readonly string[]).includes(
    value,
  );
}

export function buildHrComplianceReviewQueueRowId(input: {
  entryKind: HrComplianceReviewQueueEntryKind;
  sourceRecordId: string;
}): string {
  return `${input.entryKind}:${input.sourceRecordId}`;
}

export function parseHrComplianceReviewQueueRowId(id: string): {
  entryKind: HrComplianceReviewQueueEntryKind;
  sourceRecordId: string;
} | null {
  const separatorIndex = id.indexOf(":");
  if (separatorIndex <= 0) {
    return null;
  }

  const entryKind = id.slice(0, separatorIndex);
  const sourceRecordId = id.slice(separatorIndex + 1).trim();
  if (!isHrComplianceReviewQueueEntryKind(entryKind) || !sourceRecordId) {
    return null;
  }

  return { entryKind, sourceRecordId };
}
