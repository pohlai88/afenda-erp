export const HR_RECORDS_SENSITIVE_READ_CAPABILITY =
  "hr.employees.sensitive.read" as const;

const MASKED_VALUE = "Restricted";

export function maskHrEmployeeSensitiveEmail(
  email: string | null | undefined,
  canViewSensitive: boolean,
): string {
  if (canViewSensitive || !email?.trim()) {
    return email?.trim() ?? "";
  }

  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0) {
    return MASKED_VALUE;
  }

  return `••••@${trimmed.slice(atIndex + 1)}`;
}

export function maskHrEmployeeSensitiveIdentity(
  identityNumber: string | null | undefined,
  canViewSensitive: boolean,
): string {
  if (canViewSensitive || !identityNumber?.trim()) {
    return identityNumber?.trim() ?? "";
  }

  const trimmed = identityNumber.trim();
  if (trimmed.length <= 4) {
    return MASKED_VALUE;
  }

  return `••••${trimmed.slice(-4)}`;
}

export function maskHrEmployeeSensitivePhone(
  phoneNumber: string | null | undefined,
  canViewSensitive: boolean,
): string {
  if (canViewSensitive || !phoneNumber?.trim()) {
    return phoneNumber?.trim() ?? "";
  }

  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.length <= 4) {
    return MASKED_VALUE;
  }

  return `•••• ${digits.slice(-4)}`;
}

export function maskHrEmployeeSensitiveAddress(
  address: string | null | undefined,
  canViewSensitive: boolean,
): string {
  if (canViewSensitive || !address?.trim()) {
    return address?.trim() ?? "";
  }

  return MASKED_VALUE;
}

export function maskHrEmployeeSensitiveDateOfBirth(
  dateOfBirth: Date | null | undefined,
  canViewSensitive: boolean,
): string {
  if (canViewSensitive || !dateOfBirth) {
    return dateOfBirth ? dateOfBirth.toLocaleDateString() : "";
  }

  return MASKED_VALUE;
}
