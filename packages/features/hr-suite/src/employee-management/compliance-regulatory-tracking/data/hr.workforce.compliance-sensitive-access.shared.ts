/** HRM-CMP-024 — execution capability for identity and restricted evidence detail. */
export const HR_COMPLIANCE_SENSITIVE_READ_CAPABILITY =
  "hr.compliance.sensitive.read" as const;

export const HR_SENSITIVE_DOCUMENT_CLASSIFICATIONS = [
  "confidential",
  "restricted",
] as const;

export type HrSensitiveDocumentClassification =
  (typeof HR_SENSITIVE_DOCUMENT_CLASSIFICATIONS)[number];

export function isHrSensitiveDocumentClassification(
  classification: string,
): classification is HrSensitiveDocumentClassification {
  return (HR_SENSITIVE_DOCUMENT_CLASSIFICATIONS as readonly string[]).includes(
    classification,
  );
}

/** Registers that always carry identity or right-to-work sensitive detail. */
export const HR_COMPLIANCE_SENSITIVE_RECORD_KINDS = [
  "work_auth_document",
  "work_eligibility",
] as const;

export type HrComplianceSensitiveRecordKind =
  (typeof HR_COMPLIANCE_SENSITIVE_RECORD_KINDS)[number];

export function isHrComplianceSensitiveRecordKind(
  recordKind: string,
): recordKind is HrComplianceSensitiveRecordKind {
  return (HR_COMPLIANCE_SENSITIVE_RECORD_KINDS as readonly string[]).includes(
    recordKind,
  );
}

export const COMPLIANCE_SENSITIVE_FIELD_MASK = "Restricted";

export function maskComplianceSensitiveDisplayText(
  value: string | null | undefined,
  canViewSensitive: boolean,
): string {
  if (canViewSensitive) {
    return value?.trim() ? value : "—";
  }
  if (!value?.trim()) {
    return "—";
  }
  return COMPLIANCE_SENSITIVE_FIELD_MASK;
}

/** Serialized trailing/form cell values — empty when masked so clients never prefill secrets. */
export function maskComplianceSensitiveStoredValue(
  value: string | null | undefined,
  canViewSensitive: boolean,
): string {
  if (canViewSensitive) {
    return value ?? "";
  }
  return "";
}

export function canMutateComplianceSensitiveRecords(input: {
  canWrite: boolean;
  canViewSensitive: boolean;
}): boolean {
  return input.canWrite && input.canViewSensitive;
}

export function isComplianceEvidenceLinkSensitive(input: {
  documentClassification: string;
}): boolean {
  return isHrSensitiveDocumentClassification(input.documentClassification);
}

export function filterComplianceDocumentPickerOptions<
  T extends { classification?: string },
>(options: readonly T[], canViewSensitive: boolean): T[] {
  if (canViewSensitive) {
    return [...options];
  }

  return options.filter(
    (option) =>
      !option.classification ||
      !isHrSensitiveDocumentClassification(option.classification),
  );
}
