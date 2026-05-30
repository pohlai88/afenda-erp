export const HR_DOCUMENTS_SENSITIVE_READ_CAPABILITY =
  "hr.documents.sensitive.read" as const;

export function isHrDocumentClassificationSensitive(
  classification: string,
): boolean {
  return classification === "confidential" || classification === "restricted";
}

export function maskHrDocumentSensitiveText(
  value: string | null | undefined,
  canViewSensitive: boolean,
): string {
  if (canViewSensitive || !value?.trim()) {
    return value?.trim() ?? "";
  }
  return "Restricted document";
}
