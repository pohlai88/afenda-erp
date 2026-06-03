/** HRM-BEN-027 — sensitive benefit contribution and deduction amounts. */
export const HR_BENEFITS_SENSITIVE_READ_CAPABILITY =
  "hr.benefits.sensitive.read" as const;

export const BENEFITS_SENSITIVE_FIELD_MASK = "Restricted";

export function maskBenefitsSensitiveDisplayText(
  value: string | null | undefined,
  canViewSensitive: boolean,
): string {
  if (canViewSensitive) {
    return value?.trim() ? value : "—";
  }
  if (!value?.trim()) {
    return "—";
  }
  return BENEFITS_SENSITIVE_FIELD_MASK;
}

export function maskBenefitsSensitiveStoredValue(
  value: string | null | undefined,
  canViewSensitive: boolean,
): string {
  if (canViewSensitive) {
    return value ?? "";
  }
  return "";
}
