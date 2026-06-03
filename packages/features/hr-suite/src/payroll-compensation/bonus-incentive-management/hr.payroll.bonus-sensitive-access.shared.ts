import { HR_BONUS_SENSITIVE_READ_CAPABILITY } from "./hr.payroll.bonus-constants.shared";

export { HR_BONUS_SENSITIVE_READ_CAPABILITY };

export const BONUS_SENSITIVE_FIELD_MASK = "Restricted";

export function maskBonusSensitiveDisplayText(
  value: string | null | undefined,
  canViewSensitive: boolean,
): string {
  if (canViewSensitive) {
    return value?.trim() ? value : "—";
  }
  if (!value?.trim()) {
    return "—";
  }
  return BONUS_SENSITIVE_FIELD_MASK;
}
